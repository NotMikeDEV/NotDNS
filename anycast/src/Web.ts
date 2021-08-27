import {Database2} from "./Database"
import * as fs from "fs/promises"
import {exec} from "child_process"

const TLSDomains:any = {}

async function WriteTLS(){
    const Certs = await Database2("SELECT Domain, Timestamp, PrivateKey, Certificate FROM TLS")
    for (let x in Certs) {
        if (Certs[x].PrivateKey && Certs[x].Certificate) {
            await fs.writeFile("/data/" + Certs[x].Domain + ".key", Certs[x].PrivateKey)
            await fs.writeFile("/data/" + Certs[x].Domain + ".cert", Certs[x].Certificate)
            TLSDomains[Certs[x].Domain] = Certs[x].Timestamp
        }
    }
    console.log(TLSDomains)
}
var NginxConfig = ""
async function WriteNginx(){
    var Config = `worker_processes auto;
events {
  worker_connections  4096;
}
http {
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;
`

    const Sites = await Database2("SELECT Name, Domain, Value FROM Records WHERE Type = 'WEB'")
    for (let x in Sites) {
        const Domain = Sites[x].Domain
        const Hostname = Sites[x].Name?Sites[x].Name+"."+Domain:Domain
        const Target = Sites[x].Value
        if (TLSDomains[Domain]) {
            const Timetamp = TLSDomains[Domain]
            Config += `
    server {
        listen              80;
        server_name         ${Hostname};
        return 302 https://${Hostname}$request_uri;
    }
    server {
        listen              443 ssl;
        server_name         ${Hostname};
        ssl_certificate     /data/${Domain}.cert; # ${Timetamp}
        ssl_certificate_key /data/${Domain}.key; # ${Timetamp}
        client_max_body_size 0;
        chunked_transfer_encoding on;
        location / {
            proxy_pass                          ${Target};
            proxy_set_header  Host              ${Hostname};
            proxy_set_header  X-Real-IP         $remote_addr;
            proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header  X-Forwarded-Proto https;
        }
    }
`
        } else {
            Config += `
    server {
        listen              80;
        server_name         ${Hostname};
        client_max_body_size 0;
        chunked_transfer_encoding on;
        location / {
            proxy_pass                          ${Target};
            proxy_set_header  Host              ${Hostname};
            proxy_set_header  X-Real-IP         $remote_addr;
            proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header  X-Forwarded-Proto http;
        }
    }
`
        }
        console.log(Hostname, Target)
    }
    Config += `}`

    if (Config != NginxConfig) {
        NginxConfig = Config
        await fs.writeFile("/etc/nginx/nginx.conf", Config)
        exec("nginx -s reload||nginx")
    }
}

import {OnUpdate} from "./Rsync"
export async function Init() {
    await WriteTLS()
    await WriteNginx()
    OnUpdate(async ()=>{
        await WriteTLS()
        await WriteNginx()
    })
}
