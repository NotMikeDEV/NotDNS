import {createServer} from "http"
import * as express from "express"
const app = express()
import {HTTPHandler as DNSHTTPHandler} from "./DNS"

app.use((req, res, next)=>{
    console.log("NodeHTTP", req.method, req.url)
    next()
})
app.post("/DNS", DNSHTTPHandler);

const httpServer = createServer(app)
httpServer.listen(8000, "127.0.0.1", () => {
    console.log( `server started at http://127.0.0.1:8000` )
})

import {Init as WebInit} from "./Web"
WebInit()
