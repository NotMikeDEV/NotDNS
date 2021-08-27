import {exec} from "child_process"

const Handlers:any[] = []
export function OnUpdate(Callback:any) {
    Handlers.push(Callback)
}

function Update() {
    exec("rsync -v rsync://notdns.win/data/database.sqlite3 /data/public/database.sqlite3", async(ret, stdout, stderr)=>{
        for (let x in Handlers)
            await Handlers[x]()
    })
}
setInterval(Update, 20000)