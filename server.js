"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./client/utils");
const Sessions_1 = require("./Sessions");
const Players_1 = require("./Players");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketIO = require("socket.io");
const io = socketIO.listen(server);
server.listen(process.env.PORT || 3000);
console.log("server listening on port " + server.address().port);
app.use("/dist", express.static("client/dist"));
// route for Home-Page
app.get('/', (req, res) => {
    res.redirect("/play");
});
app.get("/play", (req, res) => {
    res.sendFile((__dirname + "/client/dist/index.html"));
});
//uno logic
io.sockets.on("connection", (socket) => {
    console.log("new socket connection");
    const player = new Players_1.Player("undefined", socket);
    Players_1.players.push(player);
    //disconnect
    socket.on("disconnect", () => {
        console.log("Disconnected");
        //disconnect player from session
        if (player.currentSession) {
            player.currentSession.removePlayer(player);
        }
        Players_1.players.splice(Players_1.players.indexOf(player), 1);
    });
    function joinSession(sID, nickname) {
        console.log("join request to session " + sID + " as nickname " + nickname);
        let newSess = (Sessions_1.sessions.find(s => s.sessionID == sID) || null);
        if (newSess && nickname && nickname.length > 1 && !newSess.players.find(p => p.playerName.trim() == nickname.trim())) {
            //add player to session
            player.playerName = nickname;
            if (player.currentSession) {
                //player leaves current session
                player.currentSession.removePlayer(player);
            }
            newSess.addPlayer(player);
            console.log(`player ${nickname} has joined session ${sID}`);
            //response
            socket.emit(utils_1.SocketEvents.ServerToClient.joinResponse, { success: true, playerID: player.playerID });
        }
        else {
            //response
            socket.emit(utils_1.SocketEvents.ServerToClient.joinResponse, { success: false });
            socket.emit(utils_1.SocketEvents.ServerToClient.alert, "Youd did something wrong while joining a session... :(");
            console.log(`Error on joining session ${sID}`);
        }
    }
    socket.on("join", (data) => {
        joinSession(data.sessionID, data.nickname);
    });
    socket.on("create", (nick) => {
        if (nick.length < 2) {
            //response
            socket.emit(utils_1.SocketEvents.ServerToClient.joinResponse, { success: false });
            return;
        }
        //Create session
        const session = new Sessions_1.Session();
        Sessions_1.sessions.push(session);
        joinSession(session.sessionID, nick);
        console.log(`created new session | id:${session.sessionID} | creator: ${player.playerName}`);
        logStats();
    });
});
function logStats() {
    console.log("--Current stats--");
    console.log(`Active Sessions: ${Sessions_1.sessions.length}`);
    console.log(`Active Players:  ${Players_1.players.length}`);
    console.log("-----------------");
}
//log stats every minute
let logTimer = setInterval(logStats, 100000);
//# sourceMappingURL=server.js.map