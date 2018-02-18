"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerUtils_1 = require("./ServerUtils");
let playerCounter = 0;
//players : hash and player itself
exports.players = [];
class Player {
    constructor(name, socket) {
        this.isReady = false;
        this.cards = [];
        this.socket = socket;
        this.playerName = name;
        this.playerID = "p" + ServerUtils_1.sha256(playerCounter.toString()).substring(0, 8);
        playerCounter++;
    }
    initGame() {
    }
}
exports.Player = Player;
//# sourceMappingURL=Players.js.map