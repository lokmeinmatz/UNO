import { setTimeout } from "timers";
import UI from "./UI"
import {GameUpdate} from "./utils"
const $ : JQueryStatic = require("./jquery")



let deck: string[] = ["r4", "g7", "b2", "y9", "r8", "g3", "b6", "y3"]



declare const io 

$(document).ready(() => {
    var socket : SocketIO.Socket = io.connect()
    
    //get canvas

    const joinHandle = function(event : JQuery.Event, jObj : JQuery) {
        event.preventDefault()
        //Send reqest to join
        const sid = jObj.find("#sessionID").val()
        const nick = jObj.find("#nickname").val()
        console.log(`trying to join ${sid} with nick ${nick}`)
        socket.emit("join", {sessionID : sid, nickname: nick})
    }

    const createHandle = function(event : JQuery.Event, jObj: JQuery) {
        event.preventDefault()
        //Send reqest to join
        const nick = jObj.find("#nickname").val()
        console.log(`trying to create session with nick ${nick}`)
        socket.emit("create", nick)
    }

    //-------------------------------
    //Handle waiting lobby
    
    
    const readyHandle = function(jObj: JQuery, ready: boolean) {
        console.log(`Player is ready: ${ready}`)
        socket.emit("waiting.ready", ready)
    }

    UI.init(joinHandle, createHandle, readyHandle)

    let playerID : string = null
    

    //get join-response
    socket.on("join.res", (res) => {
        console.log(res)
        if(res.success) {
            //Get to waiting lobby
            UI.setModal("waiting")
            playerID = res.playerID

        }
        else {
            //display error
            alert("Error on joining/creating session")
        }
    })

    
    socket.on("waiting.update", (data) => {

        console.log("received waiting.update")
        
        UI.updateWaitingScreen(data)
    })

    socket.on("game.start", () => {
        UI.setModalVisiblilty(false)
        console.log("game starting")
        //Set gameData to ui
    })

    //do the game update
    socket.on("game.update", (gameData : GameUpdate) => {
        console.log("received game.update")
        console.log(playerID, gameData.players)
        UI.setOtherPlayers(gameData.players.filter(player => player.id != playerID), gameData.activePlayerID)
        if(gameData.activePlayerID == playerID) {
            UI.setIamActive(true)
        }
        else{ UI.setIamActive(false) }
    })

    
    for(let i = 0; i < 4; i++) {
        UI.addHandCard(deck.pop())
    }
    
    UI.updateDeck(deck)
    

   

    UI.setHandClickHandler()
    
    


    

   


})



