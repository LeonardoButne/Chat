const { WebSocketServer} = require("ws")
const dotenv = require("dotenv")

dotenv.config()

const wss = new WebSocketServer ({port: process.env.PORT || 8888})

wss.on("connection", (ws) => {

    ws.on("erro", console.error)
    ws.send("Mensagem enviada pelo servidor")

    ws.on("message", (data) => {
        console.log(data.toString())
        wss.clients.forEach((client) => client.send(data.toString()))
        
    })

    console.log("client connected")
})