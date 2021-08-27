import {Database, Database2} from "./Database"
import * as crypto from 'crypto'
import {Provision as ProvisionTLS} from "./ACME"

class APIFunctions {
    Auth(User:string) {
        return {User}
    }
    async Domains(User:string) {
        const Domains = await Database2("SELECT * FROM Domains WHERE User = ? ORDER BY Domain", [User]);
        var Result = []
        for (let x in Domains) {
            Result.push(Domains[x].Domain)
        }
        return Result
    }
    async AddDomain(User:string, Domain:string) {
        try {
            await Database2.Insert("INSERT INTO Domains (Domain, User) VALUES (?, ?)", [Domain.toLowerCase(), User]);
            return true
        } catch (e) {
            return false
        }
    }
    async DeleteDomain(User:string, Domain:string) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Domain, User]);
            if (!DomainRecord.length)
                return false
            Domain = DomainRecord[0].Domain
            await Database2.Insert("DELETE FROM Domains WHERE Domain = ? AND User = ?", [Domain, User]);
            await Database2.Insert("DELETE FROM Records WHERE Domain = ?", [Domain]);
            return true
        } catch (e) {
            return false
        }
    }
    async GetRecords(User:string, Domain:string) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Domain, User]);
            if (!DomainRecord.length)
                return false
            Domain = DomainRecord[0].Domain
            return await Database2("SELECT * FROM Records WHERE Domain = ?", [Domain]);
        } catch (e) {
            return false
        }
    }
    async AddRecord(User:string, Record:any) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Record.Domain, User]);
            if (!DomainRecord.length)
                return false
            const Domain = DomainRecord[0].Domain
            if (Record.Name == "@")
                Record.Name = ""
            await Database2.Insert("INSERT INTO Records (Name, Domain, Type, TTL, Value) VALUES (?, ?, ?, ?, ?)", [Record.Name, Domain, Record.Type, Record.TTL, Record.Value]);
            return true
        } catch (e) {
            return false
        }
    }
    async SaveRecord(User:string, Record:any) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Record.Domain, User]);
            if (!DomainRecord.length)
                return false
            const Domain = DomainRecord[0].Domain
            await Database2.Insert("UPDATE Records SET Value = ? WHERE Domain = ? AND ID = ?", [Record.Value, Domain, Record.ID]);
            return true
        } catch (e) {
            return false
        }
    }
    async DeleteRecord(User:string, Record:any) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Record.Domain, User]);
            if (!DomainRecord.length)
                return false
            const Domain = DomainRecord[0].Domain
            await Database2.Insert("DELETE FROM Records WHERE Domain = ? AND ID = ?", [Domain, Record.ID]);
            return true
        } catch (e) {
            return false
        }
    }
    async TLSLog(User:string, Domain:string) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Domain, User]);
            if (!DomainRecord.length)
                return false
            Domain = DomainRecord[0].Domain
            const Logs = await Database2("SELECT LastLog FROM TLS WHERE Domain = ?", [Domain]);
            if (Logs.length)
                return JSON.stringify(Logs[0].LastLog)
            return JSON.stringify("Not Provisioned")
        } catch (e) {
            return false
        }
    }
    async ProvisionTLS(User:string, Domain:string) {
        try {
            const DomainRecord = await Database2("SELECT Domain FROM Domains WHERE Domain = ? AND User = ?", [Domain, User]);
            if (!DomainRecord.length)
                return false
            Domain = DomainRecord[0].Domain
            ProvisionTLS(Domain)
            return true
        } catch (e) {
            return false
        }
    }
    
}
const API = new APIFunctions()

export async function HTTPHandler(req:any, res:any) {
    res.set({"Content-Type": "application/json"})
    if (req.method != "POST") {
        return res.sendStatus(403).end(undefined)
    }
    var User:any = undefined
    try {
        var AuthHeader = JSON.parse(req.headers['authorization'])
        const PasswordHash = crypto.createHash('sha256').update(AuthHeader.Username.toLowerCase()+AuthHeader.Password).digest('hex')
        User = await Database("SELECT * FROM Users WHERE Username = ? AND PasswordHash = ?", [AuthHeader.Username.toLowerCase(), PasswordHash]);
        if (!User.length)
            throw "Invalid Username/Password"
        User = User[0].Username
    } catch (e) {
        console.log(e)
        res.set({"WWW-Authenticate": 'NotDNS'})
        return res.sendStatus(401).end(undefined)
    }
    var Body = ""
    req.on('data', (data:string)=>{
        Body += data
    })
    req.on('end', async()=>{
        try {
            const Request:any = JSON.parse(Body)
            console.log(Request)
            if (Request.Type == "Auth")
                return res.send(await API.Auth(User))
            if (Request.Type == "Domains")
                return res.send(await API.Domains(User))
            if (Request.Type == "AddDomain")
                return res.send(await API.AddDomain(User, Request.Data))
            if (Request.Type == "DeleteDomain")
                return res.send(await API.DeleteDomain(User, Request.Data))
            if (Request.Type == "GetRecords")
                return res.send(await API.GetRecords(User, Request.Data))
            if (Request.Type == "AddRecord")
                return res.send(await API.AddRecord(User, Request.Data))
            if (Request.Type == "SaveRecord")
                return res.send(await API.SaveRecord(User, Request.Data))
            if (Request.Type == "DeleteRecord")
                return res.send(await API.DeleteRecord(User, Request.Data))
            if (Request.Type == "TLSLog")
                return res.send(await API.TLSLog(User, Request.Data))
            if (Request.Type == "ProvisionTLS")
                return res.send(await API.ProvisionTLS(User, Request.Data))
            res.send(undefined)
        } catch (e) {
            res.send(undefined)
        }
    })
}