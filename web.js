/*jshint esversion: 6 */
const commands = ["login", "help", "version"];
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const dataIn = require("socket.io-client");
const URL = "http://localhost:3003";
const dataSock = dataIn(URL, { autoConnect: true });
const WebSocket = require('ws');
const wsServ = new WebSocket.Server({ noServer: true });
const _VERSION = "Betazed";
wsServ.on("connection", function connection(ws) {
    ws.send(JSON.stringify({ "Type": "id", "id": _VERSION }));
    ws.on('message', function incoming(message) {
        try {
            var data = JSON.parse(message);
            if (data.Type === "Command") {
                let cmd = data.Command.split(" ");
                if (commands.includes(cmd[0])) {
                    if (cmd[0] === "login") {
                        if (cmd.length == 2) {
                            if (cmd[1] === "Ezri") {
                                ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Authenticated!" }));
                            }
                            else {
                                ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Incorrect login" }));
                            }
                        }else {
                            ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Incorrect Login Syntax: login pw" }));
                        }
                    } else if (cmd[0] === "help") {
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Available commands: login, help, version" }));
                    }
                    else if (cmd[0] === "version") {
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": _VERSION }));
                    }
                }
                else {
                    ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Unknown Command" }));
                }
            } else {
                ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Command Not Found" }));
            }
        } catch (e) {
        console.log(e);
    }
});
const interval = setInterval(function () {
    ws.send(JSON.stringify({ "Type": "data", "Drivers": drv, "Session": sess }));
}, 1000);
})

app.use(express.static(__dirname + "/public"));
global.drv = []
dataSock.on("d", (drv, sess) => {
    global.drv = drv;
    global.sess = sess;
});
//app.use(compression())
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/favicon.ico", (req, res) => {
    res.sendFile(__dirname + "/favicon.ico");
})
server.on('upgrade', (request, socket, head) => {
    wsServ.handleUpgrade(request, socket, head, socket => {
        wsServ.emit('connection', socket, request);
    });
});
server.listen(80, () => {
    console.log("Web page service Starting");
});