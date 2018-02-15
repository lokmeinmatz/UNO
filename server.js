"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketIO = require("socket.io");
const crypto = require('crypto');
function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}
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
//for hashed id
let sessionCounter = 0;
let playerCounter = 0;
var SessionState;
(function (SessionState) {
    SessionState[SessionState["WAITING"] = 0] = "WAITING";
    SessionState[SessionState["PLAYING"] = 1] = "PLAYING";
})(SessionState || (SessionState = {}));
class Session {
    constructor() {
        this.sessionState = SessionState.WAITING;
        this.players = []; //contains playerID
        this.activePlayerIndex = 0;
        this.sessionID = "s" + sha256(sessionCounter.toString()).substring(0, 6);
        sessionCounter++;
    }
    addPlayer(player) {
        if (this.sessionState == SessionState.WAITING) {
            player.currentSession = this;
            this.players.push(player);
            //broadcast to all that new player has joined
            this.sendPlayerListUpdate();
        }
    }
    removePlayer(player) {
        this.players.splice(this.players.indexOf(player));
        player.currentSession = null;
        this.sendPlayerListUpdate();
        //delete session if empty
        if (this.players.length <= 0) {
            sessions.splice(sessions.indexOf(this), 1);
            console.log(`Session ${this.sessionID} is empty`);
        }
    }
    checkState() {
        if (this.players.length > 1 && this.players.every((player) => {
            return player.isReady;
        })) {
            //every player of this session is ready
            this.startGame();
        }
    }
    sendToPlayers(event, data) {
        for (let player of this.players) {
            player.socket.emit(event, data);
        }
    }
    sendPlayerListUpdate() {
        const playerSocketData = [];
        for (let player of this.players) {
            let data = { name: player.playerName, id: player.playerID, ready: player.isReady };
            playerSocketData.push(data);
        }
        this.sendToPlayers("waiting.update", { players: playerSocketData, sessionID: this.sessionID });
    }
    startGame() {
        console.log(`Sessions ${this.sessionID} started it's game`);
        this.sendToPlayers("game.start", {});
        this.sendGameUpdate();
    }
    sendGameUpdate() {
        let gameUpdate = {
            players: [],
            activePlayer: this.players[this.activePlayerIndex].playerID,
            direction: true
        };
        gameUpdate.players = Array.from(this.players).map((player) => { return { name: player.playerName, id: player.playerID, cards: player.cards.length }; });
        this.sendToPlayers("game.update", gameUpdate);
    }
}
class Player {
    constructor(name, socket) {
        this.isReady = false;
        this.cards = [];
        this.socket = socket;
        this.playerName = name;
        this.playerID = "p" + sha256(playerCounter.toString()).substring(0, 8);
        playerCounter++;
    }
    initGame() {
    }
}
//uno logic
//sessions : hash and session itself
const sessions = [];
//players : hash and player itself
const players = [];
io.sockets.on("connection", (socket) => {
    console.log("new socket connection");
    const player = new Player("undefined", socket);
    players.push(player);
    //disconnect
    socket.on("disconnect", () => {
        console.log("Disconnected");
        //disconnect player from session
        if (player.currentSession) {
            player.currentSession.removePlayer(player);
        }
        players.splice(players.indexOf(player), 1);
    });
    function joinSession(sID, nickname) {
        console.log("join request to session " + sID + " as nickname " + nickname);
        let newSess = null;
        if (newSess = sessions.find(s => s.sessionID == sID) || null && nickname && nickname.length > 1) {
            //add player to session
            player.playerName = nickname;
            if (player.currentSession) {
                //player leaves current session
                player.currentSession.removePlayer(player);
            }
            newSess.addPlayer(player);
            console.log(`player ${nickname} has joined session ${sID}`);
            //response
            socket.emit("join.res", { success: true, playerID: player.playerID });
        }
        else {
            //response
            socket.emit("join-res", { success: false });
            console.log(`Error on joining session ${sID}`);
        }
    }
    socket.on("join", (data) => {
        joinSession(data.sessionID, data.nickname);
    });
    socket.on("create", (nick) => {
        if (nick.length < 2) {
            //response
            socket.emit("join.res", { success: false });
            return;
        }
        //Create session
        const session = new Session();
        sessions.push(session);
        joinSession(session.sessionID, nick);
        console.log(`created new session | id:${session.sessionID} | creator: ${player.playerName}`);
        logStats();
    });
    socket.on("waiting.ready", (state) => {
        if (player.currentSession) {
            console.log("received waiting.ready");
            player.isReady = state;
            player.currentSession.sendPlayerListUpdate();
            player.currentSession.checkState();
        }
    });
});
function logStats() {
    console.log("--Current stats--");
    console.log(`Active Sessions: ${sessions.length}`);
    console.log(`Active Players:  ${players.length}`);
    console.log("-----------------");
}
//log stats every minute
let logTimer = setInterval(logStats, 100000);
//# sourceMappingURL=server.js.map