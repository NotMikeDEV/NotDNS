import {Database as SQLite3} from "sqlite3"
import {OnUpdate} from "./Rsync"

var db = new SQLite3('/data/database.sqlite3')
OnUpdate(()=>{db = new SQLite3('/data/database.sqlite3')})

export async function Database(SQL:string, Params:any[]=[]):Promise<any> {
    var ResolvePromise:any = false
    const MyPromise = new Promise((R:any)=>{ResolvePromise=R})
    db.all(SQL, Params, function(this:any, Err:any, Result:any){
        try {
            if (Err)
                throw Err
            ResolvePromise(Result)
        } catch (Err) {console.log(SQL, Params, Err); ResolvePromise([])}
    })
    return await MyPromise
}

Database.Insert = async function(SQL:string, Params:any[]=[]):Promise<any> {
    var ResolvePromise:any = false
    const MyPromise = new Promise((R:any)=>{ResolvePromise=R})
    db.run(SQL, Params, function(this:any, Err:any, Result:any){
        try {
            if (Err)
                throw Err
            ResolvePromise(this.lastID)
        } catch (Err) {console.log(SQL, Params, Err); ResolvePromise(undefined)}
    })
    return await MyPromise
}

var db2 = new SQLite3('/data/public/database.sqlite3')
OnUpdate(()=>{db2 = new SQLite3('/data/public/database.sqlite3')})

export async function Database2(SQL:string, Params:any[]=[]):Promise<any> {
    var ResolvePromise:any = false
    const MyPromise = new Promise((R:any)=>{ResolvePromise=R})
    db2.all(SQL, Params, function(this:any, Err:any, Result:any){
        try {
            if (Err)
                throw Err
            ResolvePromise(Result)
        } catch (Err) {console.log(SQL, Params, Err); ResolvePromise([])}
    })
    return await MyPromise
}

Database2.Insert = async function(SQL:string, Params:any[]=[]):Promise<any> {
    var ResolvePromise:any = false
    const MyPromise = new Promise((R:any)=>{ResolvePromise=R})
    db2.run(SQL, Params, function(this:any, Err:any, Result:any){
        try {
            if (Err)
                throw Err
            ResolvePromise(this.lastID)
        } catch (Err) {console.log(SQL, Params, Err); ResolvePromise(undefined)}
    })
    return await MyPromise
}