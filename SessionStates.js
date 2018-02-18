"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmptyState {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }
    removeListeners() {
        console.info("Empty State has no Listeners");
    }
}
class WaitingState {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }
    removeListeners() {
        console.info("Empty State has no Listeners");
    }
}
class SessionStateManager {
    constructor() { this.state = new EmptyState(this); }
    setState(newState) {
        this.state.removeListeners();
        this.state = newState;
    }
}
//Doesnot work on server because we have multiple states simultanously (one per session)
exports.default = SessionStateManager;
//# sourceMappingURL=SessionStates.js.map