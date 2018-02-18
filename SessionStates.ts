interface SessionState {
    socket : SocketIO.Socket
    stateManager : SessionStateManager

    removeListeners()
}

class EmptyState implements SessionState {
    socket : SocketIO.Socket
    stateManager : SessionStateManager

    constructor(stateManager) {
        this.stateManager = stateManager
    }

    removeListeners() {
        console.info("Empty State has no Listeners")
    }
}


class WaitingState implements SessionState {
    socket : SocketIO.Socket
    stateManager : SessionStateManager
    

    constructor(stateManager) {
        this.stateManager = stateManager
    }

    removeListeners() {
        console.info("Empty State has no Listeners")
    }
}

class SessionStateManager {
    private state : SessionState
    constructor() {this.state = new EmptyState(this)}

    setState(newState : SessionState) {
        this.state.removeListeners()
        this.state = newState
    }
}
//Doesnot work on server because we have multiple states simultanously (one per session)

export default SessionStateManager