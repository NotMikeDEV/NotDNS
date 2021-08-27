import {Database, Database2} from "./Database"

export async function HTTPHandler(req:any, res:any) {
    var Request:any = ""
    req.on("data", (data:string)=>{
        Request += data
    })
    req.on("end", async()=>{
        try {
            const Data:any = JSON.parse(Request)
            console.log(Request)
            const Result:any = []

            if (Data.method == 'lookup' && Data.parameters.qtype == 'SOA') {
                const Hostname = Data.parameters.qname.substr(0, Data.parameters.qname.length - 1).toLowerCase()
                console.log("Lookup", Data.parameters.qtype, Hostname)
                const Domain = await Database2("SELECT Domain FROM Domains WHERE Domain = ?", [Hostname])
                if (Domain.length)
                    Result.push({"qtype":"SOA", "qname":Data.parameters.qname, "content":"notdns.win. hostmaster.notdns.win. 1 30 30 30 5", "ttl": 5})
            } else if (Data.method == 'lookup') {
                const Hostname = Data.parameters.qname.substr(0, Data.parameters.qname.length - 1).toLowerCase()
                console.log("Lookup", Data.parameters.qtype, Hostname)
                const Domain = await Database2("SELECT Domain FROM Domains WHERE Domain = ? OR Domain = SUBSTR(?, 0 - LENGTH(Domain)) ORDER BY LENGTH(Domain) DESC LIMIT 1", [Hostname, Hostname])
                if (Domain.length) {
                    const Subdomain = Hostname == Domain[0].Domain?'':Hostname.substr(0, Hostname.length - Domain[0].Domain.length - 1)
                    console.log("Subdomain", Subdomain)
                    const Records = await Database2("SELECT Name, Type, TTL, Value FROM Records WHERE Domain = ? AND Name = ?", [Domain[0].Domain, Subdomain])
                    var DoneNS = false
                    var DoneA = false
                    var DoneAAAA = false
                    var WebRecord = false
                    if (Subdomain == '_acme-challenge') {
                        Result.push({"qtype":"NS", "qname":Data.parameters.qname, "content":"notdns.win.", "ttl": 30})
                    } else for (let x in Records) {
                        if (Records[x].Type == 'NS')
                            DoneNS = true
                        if (Records[x].Type == 'A')
                            DoneA = true
                        if (Records[x].Type == 'AAAA')
                            DoneAAAA = true

                        if (Records[x].Type == 'WEB') {
                            WebRecord = true
                        } else if (Data.parameters.qtype == 'ANY' || Data.parameters.qtype == Records[x].Type) {
                            Result.push({"qtype":Records[x].Type, "qname":Data.parameters.qname, "content":Records[x].Value, "ttl": Records[x].TTL?Records[x].TTL:15})
                        }
                    }
                    if (WebRecord && !DoneA && Data.parameters.qtype != 'NS')
                        Result.push({"qtype":'A', "qname":Data.parameters.qname, "content":'44.131.14.53', "ttl": 30})
                    if (WebRecord && !DoneAAAA && Data.parameters.qtype != 'NS')
                        Result.push({"qtype":'AAAA', "qname":Data.parameters.qname, "content":'2a06:8187:fe19::53', "ttl": 30})
                    if (!DoneNS && Subdomain == '') {
                        Result.push({"qtype":'NS', "qname":Data.parameters.qname, "content":'notdns.in.', "ttl": 300})
                        Result.push({"qtype":'NS', "qname":Data.parameters.qname, "content":'notdns.win.', "ttl": 300})
                    }
                }
            } else if (Data.method == 'getDomainMetadata') {
            } else if (Data.method == 'list') {
                const DomainName = Data.parameters.zonename.substr(0, Data.parameters.zonename.length - 1).toLowerCase()
                console.log("List", DomainName)
                const Domain = await Database2("SELECT Domain FROM Domains WHERE Domain = ?", [DomainName])
                if (Domain.length) {
                    Result.push({"qtype":"SOA", "qname":DomainName + ".", "content":"notdns.win. hostmaster.notdns.win. 1 30 30 30 5", "ttl": 5})
                    const Records = await Database2("SELECT Name, Type, TTL, Value FROM Records WHERE Domain = ?", [DomainName])
                    var DoneNS = false
                    for (let x in Records) {
                        const QName = Records[x].Name?Records[x].Name + "." + DomainName + "." : DomainName + "."
                        if (Records[x].Type == 'NS')
                            DoneNS = true
                        if (Records[x].Type == 'WEB') {
                            Result.push({"qtype":"A", "qname":QName, "content":'44.131.14.53', "ttl": 30})
                            Result.push({"qtype":"AAAA", "qname":QName, "content":'2a06:8187:fe19::53', "ttl": 30})
                        } else {
                            Result.push({"qtype":Records[x].Type, "qname":QName, "content":Records[x].Value, "ttl": Records[x].TTL?Records[x].TTL:15})
                        }
                    }
                    if (!DoneNS) {
                        Result.push({"qtype":'NS', "qname":DomainName+".", "content":'notdns.in.', "ttl": 300})
                        Result.push({"qtype":'NS', "qname":DomainName+".", "content":'notdns.win.', "ttl": 300})
                    }
                }
            } else {
                console.log(Data.method, Data)
            }
            console.log(Result)
            res.send({result: Result})
        } catch (e) {
            res.end("{}")
        }
    })
}