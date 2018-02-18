import {Session} from "./Sessions"
import {sha256} from "./ServerUtils"


let playerCounter = 0


//players : hash and player itself
export const players : Player[] = []

export class Player {
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