import { read } from "fs";
import {GameUpdate} from "./client/utils"



import {sessions, Session} from "./Sessions"
import {players, Player} from "./Players"

const express = require("express")
const app = express()
const server = require("http").createServer(app)
const socketIO = require("socket.io")

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



//uno logic






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
        
        let newSess: Session = (sessions.find(s => s.sessionID == sID) || null);
        
        if(newSess && nickname && nickname.length > 1 && !newSess.players.find(p => p.playerName.trim() == nickname.trim())) {
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
            socket.emit("alert", "Youd did something wrong while joining a session... :(")
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

    socket.on("waiting.update.req", () => {
        if(player.currentSession) {
            player.currentSession.sendPlayerListUpdate()
        }
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