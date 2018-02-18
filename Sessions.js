"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerUtils_1 = require("./ServerUtils");
var SessionState;
(function (SessionState) {
    SessionState[SessionState["WAITING"] = 0] = "WAITING";
    SessionState[SessionState["PLAYING"] = 1] = "PLAYING";
})(SessionState || (SessionState = {}));
let sessionCounter = 0;
//sessions : hash and session itself
exports.sessions = [];
class Session {
    constructor() {
        this.sessionState = SessionState.WAITING;
        this.players = []; //contains playerID
        this.activePlayerIndex = 0;
        this.sessionID = "s" + ServerUtils_1.sha256(sessionCounter.toString()).substring(0, 6);
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
            exports.sessions.splice(exports.sessions.indexOf(this), 1);
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
        this.sendToPlayers("waiting.update.res", { players: playerSocketData, sessionID: this.sessionID });
    }
    startGame() {
        console.log(`Sessions ${this.sessionID} started it's game`);
        this.sendToPlayers("game.start", {});
        this.sendGameUpdate();
    }
    sendGameUpdate() {
        let gameUpdate = {
            players: [],
            activePlayerID: this.players[this.activePlayerIndex].playerID,
            direction: true,
            handcards: []
        };
        gameUpdate.players = Array.from(this.players).map((player) => { return { name: player.playerName, id: player.playerID, cards: player.cards.length }; });
        this.sendToPlayers("game.update", gameUpdate);
    }
}
exports.Session = Session;
//# sourceMappingURL=Sessions.js.map