import {sha256} from "./ServerUtils"
import {GameUpdate} from "./client/utils"
import {Player} from "./Players"

enum SessionState {
    WAITING,
    PLAYING
}


let sessionCounter = 0
//sessions : hash and session itself
export const sessions : Session[] = []


export class Session {

    sessionState : SessionState = SessionState.WAITING

    readonly sessionID : string
    players : Player[] = [] //contains playerID

    activePlayerIndex : number = 0

    constructor() {
        
        this.sessionID = "s"+sha256(sessionCounter.toString()).substring(0, 6)
        sessionCounter++
    }

    addPlayer(player : Player) {
        if(this.sessionState == SessionState.WAITING) {
            player.currentSession = this
            this.players.push(player)
            
            //broadcast to all that new player has joined
            this.sendPlayerListUpdate()
        }
    }

    removePlayer(player : Player) {
        this.players.splice(this.players.indexOf(player))
        player.currentSession = null
        this.sendPlayerListUpdate()


        //delete session if empty
        if(this.players.length <= 0) {
            sessions.splice(sessions.indexOf(this), 1)
            console.log(`Session ${this.sessionID} is empty`)
        }
    }

    checkState() {
        if(this.players.length > 1 && this.players.every((player) : boolean => {
            return player.isReady
        })) {
            //every player of this session is ready
            this.startGame()
        }
    }

    sendToPlayers(event : string, data : any) {
        for (let player of this.players) {
            player.socket.emit(event, data)
        }
    }

    

    sendPlayerListUpdate() {
        const playerSocketData = []
        for (let player of this.players) {
            let data = {name:player.playerName, id:player.playerID, ready:player.isReady}
            playerSocketData.push(data)
        }
        this.sendToPlayers("waiting.update.res", {players:playerSocketData, sessionID: this.sessionID})

       
    }

    startGame() {
        console.log(`Sessions ${this.sessionID} started it's game`)
        

        this.sendToPlayers("game.start", {
            //empty, not relevant
        })

        this.sendGameUpdate()
    }

    sendGameUpdate() {
        let gameUpdate : GameUpdate = {
            players:[],
            activePlayerID : this.players[this.activePlayerIndex].playerID,
            direction: true,
            handcards: []
        }

        gameUpdate.players = Array.from(this.players).map((player) => {return {name:player.playerName, id:player.playerID, cards:player.cards.length}})

        

        this.sendToPlayers("game.update", gameUpdate)
    }

}
