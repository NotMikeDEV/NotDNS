import {Database, Database2} from "./Database"
export const ACMEChallenges:any = {}

const acme = require('acme-client')
const Directory = acme.directory.letsencrypt.production;

var ACMEClient:any = false;
async function LoadACME() {
    var Account:any = await Database("SELECT Value FROM Settings WHERE Name = 'ACME_Account'")
    if (!Account.length) { // New ACME Account
        Account = {
            directoryUrl: Directory,
            accountKey: (await acme.forge.createPrivateKey()).toString()
        };
        var client = new acme.Client(Account);
        var Response = await client.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:acme@server.email']
        });
        Account.accountUrl = client.api.accountUrl;
        console.log("Created ACME account", Account);
        await Database("INSERT OR REPLACE INTO Settings (Name, Value) VALUES ('ACME_Account', ?)", [JSON.stringify(Account)])
    } else {
        Account = JSON.parse(Account[0].Value)
    }
    ACMEClient = new acme.Client(Account);
}
LoadACME()

export async function Provision(Domain:string) {
    var Log = ""
    async function AppendLog(...Text:string[]) {
        console.log(...Text);
        Log += Text.join(" ") + "\n";
        await Database2.Insert("UPDATE TLS SET LastLog = ? WHERE Domain = ?", [Log, Domain])
    }
    try {
        await Database2.Insert("INSERT INTO TLS (Domain) VALUES (?)", [Domain])
        await Database2.Insert("UPDATE TLS SET Status = 'Provisioning' WHERE Domain = ?", [Domain])
        var RequestedNames = []
        RequestedNames.push({ type: 'dns', value: Domain })
        RequestedNames.push({ type: 'dns', value: "*." + Domain })
        await AppendLog("Creating Order")
        const Order = await ACMEClient.createOrder({identifiers: RequestedNames})
        await AppendLog("Getting Authorisations")
        var Auths = await ACMEClient.getAuthorizations(Order)
        for (let x in Auths)
        {
            var Auth = Auths[x];
            await AppendLog("Requesting TLS for", Auth.identifier.value)
            for (let y in Auth.challenges)
            {
                var Challenge = Auth.challenges[y]
                if (Challenge.type == 'dns-01')
                {
                    const keyAuthorization = await ACMEClient.getChallengeKeyAuthorization(Challenge);
                    await AppendLog("ACME Challenge", Auth.identifier.value, Challenge.token, keyAuthorization);
                    ACMEChallenges["_acme-challenge." + Domain] = keyAuthorization;
                    await AppendLog("verifyChallenge", Auth, Challenge)
                    await ACMEClient.verifyChallenge(Auth, Challenge)
                    await AppendLog("completeChallenge", Challenge)
                    await ACMEClient.completeChallenge(Challenge)
                    await AppendLog("ACME Validation Response", await ACMEClient.waitForValidStatus(Challenge));
                }
            }
        }
        // Provision Certificate
        var CertNames = {
            commonName: Domain,
            altNames: ["*." + Domain]
        }
        const [key, csr] = await acme.forge.createCsr(CertNames);
        await AppendLog("finalizeOrder")
        await ACMEClient.finalizeOrder(Order, csr);
        await AppendLog("getCertificate")
        const cert = await ACMEClient.getCertificate(Order);
        await Database2.Insert("UPDATE TLS SET Status = 'OK', PrivateKey = ?, Certificate = ?, Timestamp = ? WHERE Domain = ?", [key.toString(), cert.toString(), Math.floor((new Date()).getTime()/1000),Domain])
        await AppendLog("Complete")
        return true
    } catch (e:any) {
        await AppendLog(e)
        await Database2.Insert("UPDATE TLS SET Status = 'Error' WHERE Domain = ?", [Domain])
        return false
    }
}
