"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingStateManager = void 0;
class LoadingStateManager {
    constructor() {
        this.subscribers = new Set();
        this.currentState = {
            isLoading: false,
            type: 'default'
        };
    }
    static getInstance() {
        if (!LoadingStateManager.instance) {
            LoadingStateManager.instance = new LoadingStateManager();
        }
        return LoadingStateManager.instance;
    }
    show(options = {}) {
        this.currentState = Object.assign(Object.assign(Object.assign({}, this.currentState), options), { isLoading: true });
        this.notifySubscribers();
    }
    hide() {
        this.currentState = {
            isLoading: false,
            type: 'default'
        };
        this.notifySubscribers();
    }
    updateProgress(progress, message) {
        this.currentState = Object.assign(Object.assign({}, this.currentState), { progress,
            message, type: 'progress' });
        this.notifySubscribers();
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.currentState));
    }
}
exports.loadingStateManager = LoadingStateManager.getInstance();
