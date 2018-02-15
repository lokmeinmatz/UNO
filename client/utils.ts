export interface GameUpdate {
    players: {name: string, id: string, cards: number}[]
    activePlayerID : string //player id
    direction : boolean //clockwise
    handcards: string[]
}
