
//CLIENT

import UI from "./UI"
const $ : JQueryStatic = require("./jquery")
import {GameUpdate, PlayerEvent, SocketEvents} from "./utils"

interface UserState {
    socket : SocketIO.Socket

    

    removeListeners()
}

class EmptyState implements UserState {
    socket : SocketIO.Socket

    removeListeners() {
        console.info("Empty State has no Listeners")
    }
}

const UserData: {id:string, currentName: string} = {id: "", currentName: ""}


export class JoinState implements UserState {
    socket : SocketIO.Socket




    constructor(socket : SocketIO.Socket) {
        this.socket = socket

        //handle join 
        $("#join-session-tab form").submit(function(event) {
            event.preventDefault()
            //Send reqest to join
            const sid = $(this).find("#sessionID").val()
            const nick = $(this).find("#nickname").val()
            console.log(`trying to join ${sid} with nick ${nick}`)
            socket.emit(SocketEvents.ClientToServer.join, {sessionID : sid, nickname: nick})
            return false
        })


        //handle create
        $("#create-session-tab form").submit(function(event) {
            event.preventDefault()
            //Send reqest to join
            const nick = $(this).find("#nickname").val()
            console.log(`trying to create session with nick ${nick}`)
            socket.emit(SocketEvents.ClientToServer.create, nick)
            return false
        })

        //get join-response
        socket.on(SocketEvents.ServerToClient.joinResponse, (res) => {
            console.log(res)
            if(res.success) {
                //Get to waiting lobby
                UI.setModal("waiting")
                UserData.id = res.playerID

                //Switch to waiting state
                userState.setState(new WaitingState(socket))
            }
            else {
                //display error
                alert("Error on joining/creating session")
            }
        })


    }


    removeListeners() {
        $("#join-session-tab form").off("submit")
        $("#create-session-tab form").off("submit")
        this.socket.removeAllListeners(SocketEvents.ServerToClient.joinResponse)
    }

}

class WaitingState implements UserState {
    socket : SocketIO.Socket


    constructor(socket : SocketIO.Socket) {
        this.socket = socket

        //ready 
        //handle ready
        $(".modal#waiting button").click(function() {
            
            let ready = false
            if($(this).hasClass("ready")) {
                $(this).removeClass("ready")
                $(this).text("I'M READY")
                
            }
            else {
                $(this).addClass("ready")
                $(this).text("WAIT FOR PLAYERS")
                ready = true
            }
            console.log(`Player is ready: ${ready}`)
            socket.emit(SocketEvents.ClientToServer.ready, ready)
            
        })

        //update waiting screen
        socket.on("waiting.update.res", (data) => {

            console.log("received waiting.update")
            
            //Set session id
            $(".modal#waiting h1").text("SessionID: "+data.sessionID)

            const root = $(".modal#waiting table")
            root.children().remove()
            for(let player of data.players) {
                const tr = $("<tr>")
                tr.append("<td>"+player.name+"</td>")
                tr.append("<td>"+player.id+"</td>")
                if(player.ready)tr.append("<td><i class='material-icons'>done</i></td>")
                else tr.append("<td><i class='material-icons'>cached</i></td>")
                root.append(tr)
            }
        })
        socket.emit("waiting.update.req")

        //Start game
        socket.on("game.start", () => {
            UI.setModalVisiblilty(false)
            console.log("game starting")
            //set playing state
            userState.setState(new PlayState(socket))
        })
    }

    removeListeners() {
        $(".modal#waiting button").off("click")
        this.socket.removeAllListeners("waiting.update")
        this.socket.removeAllListeners("game.start")
    }

}

class PlayState implements UserState {
    socket : SocketIO.Socket

    constructor(socket : SocketIO.Socket) {
        this.socket = socket

        //do the game update
        socket.on("game.update", (gameData : GameUpdate) => {
            console.log("received game.update")
            UI.setOtherPlayers(gameData.players.filter(player => player.id != UserData.id), gameData.activePlayerID)
            if(gameData.activePlayerID == UserData.id) {
                UI.setIamActive(true)
            }
            else{ UI.setIamActive(false) }

            UI.setDirection(gameData.direction)
            
        })

        UI.updateDeck(5, () => {
            //draw card

            let playerEvent : PlayerEvent = {type : "", data : {}}

            socket.emit("game.playerEvent", playerEvent)
        })
    }

    removeListeners() {
        this.socket.removeAllListeners("game.update")
    }
}

class UserStateManager {
    private state : UserState
    constructor() {this.state = new EmptyState()}

    setState(newState : UserState) {
        this.state.removeListeners()
        this.state = newState
    }
}

let userState : UserStateManager = new UserStateManager()
export default userState