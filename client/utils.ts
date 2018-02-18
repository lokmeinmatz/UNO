export interface GameUpdate {
    players: {name: string, id: string, cards: number}[]
    activePlayerID : string //player id
    direction : boolean //clockwise
    handcards: string[]
}

export interface PlayerEvent {
    type : string 
    data : any
}

export const SocketEvents = {
    ClientToServer : {
        join : "join",
        create : "create",
        ready : "waiting.ready"
    },
    ServerToClient : {
        joinResponse : "join.res",
        alert : "alert"
    }
    
}
