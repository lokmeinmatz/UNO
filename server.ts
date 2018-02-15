import { read } from "fs";
import {GameUpdate} from "./client/utils"
const express = require("express")
const app = express()
const server = require("http").createServer(app)
const socketIO = require("socket.io")
const crypto = require('crypto');

function sha256(data) : string {
    return crypto.createHash("sha256").update(data).digest("hex");
}
const io = socketIO.listen(server)





server.listen(process.env.PORT || 3000)
console.log("server listening on port "+server.address().port)
app.use("/dist", express.static("client/dist"))


// route for Home-Page
app.get('/', (req, res) => {
    res.redirect("/play")
});

app.get("/play", (req, res) => {
    res.sendFile((__dirname + "/client/dist/index.html"))
})

//for hashed id
let sessionCounter = 0
let playerCounter = 0

enum SessionState {
    WAITING,
    PLAYING
}

class Session {

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
        this.sendToPlayers("waiting.update", {players:playerSocketData, sessionID: this.sessionID})

       
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


class Player {
    readonly playerID : string
    playerName : string
    readonly socket : SocketIO.Socket
    currentSession? : Session
    isReady : boolean = false
    cards? : string[] = []

    constructor(name : string, socket: SocketIO.Socket) {
        this.socket = socket
        this.playerName = name
        this.playerID = "p"+sha256(playerCounter.toString()).substring(0, 8)
        playerCounter++
    }

    initGame() {
        
    }
}

//uno logic

//sessions : hash and session itself
const sessions : Session[] = []

//players : hash and player itself
const players : Player[] = []


io.sockets.on("connection", (socket : SocketIO.Socket) => {
    
    console.log("new socket connection")


    const player : Player = new Player("undefined", socket)
    
    players.push(player)
    
    
    //disconnect
    socket.on("disconnect", () => {
        
        console.log("Disconnected")

        //disconnect player from session
        if(player.currentSession) {
            player.currentSession.removePlayer(player)
        }
        players.splice(players.indexOf(player), 1)
    })

    function joinSession(sID : string, nickname: string) {
        console.log("join request to session "+sID+" as nickname "+nickname)

        let newSess: Session = null;
        
        if(newSess = sessions.find(s => s.sessionID == sID) || null && nickname && nickname.length > 1) {
            //add player to session
            player.playerName = nickname
            
            if(player.currentSession) {
                //player leaves current session
                player.currentSession.removePlayer(player)
            }

            newSess.addPlayer(player)


            console.log(`player ${nickname} has joined session ${sID}`)

            //response
            socket.emit("join.res", {success: true, playerID:player.playerID})
        }
        else{

            //response
            socket.emit("join-res", {success: false})
            console.log(`Error on joining session ${sID}`)
        }
    }

    socket.on("join", (data) => {
        joinSession(data.sessionID, data.nickname)
    })

    socket.on("create", (nick : string) => {

        if(nick.length < 2) {
            //response
            socket.emit("join.res", {success: false})
            return
        }

        
        //Create session
        const session = new Session()
        sessions.push(session)
        joinSession(session.sessionID, nick)
        console.log(`created new session | id:${session.sessionID} | creator: ${player.playerName}`)

        logStats()

       
    })

    socket.on("waiting.ready", (state) => {
        if(player.currentSession){
            console.log("received waiting.ready")
            player.isReady = state
            
            player.currentSession.sendPlayerListUpdate()
            player.currentSession.checkState()
        }
        
    })

   
})

function logStats() {
    console.log("--Current stats--")
    console.log(`Active Sessions: ${sessions.length}`)
    console.log(`Active Players:  ${players.length}`)
    console.log("-----------------")
}

//log stats every minute
let logTimer = setInterval(logStats, 100000)