import { setTimeout } from "timers";
import UI from "./UI"
import userState, {JoinState} from "./ClientStates"
const $ : JQueryStatic = require("./jquery")



let deck: string[] = ["r4", "g7", "b2", "y9", "r8", "g3", "b6", "y3"]



declare const io 

$(document).ready(() => {
    var socket : SocketIO.Socket = io.connect()
  
    UI.init()

    socket.on("alert", (text) => {
        alert(text)
    })

    userState.setState(new JoinState(socket))

    
    for(let i = 0; i < 4; i++) {
        UI.addHandCard(deck.pop())
    }
    
    
    

   

    UI.setHandClickHandler()
    
    


    

   


})



