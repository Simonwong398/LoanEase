"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmationManager = void 0;
class ConfirmationManager {
    constructor() {
        this.subscribers = new Set();
        this.currentOptions = null;
    }
    static getInstance() {
        if (!ConfirmationManager.instance) {
            ConfirmationManager.instance = new ConfirmationManager();
        }
        return ConfirmationManager.instance;
    }
    show(options) {
        this.currentOptions = options;
        this.notifySubscribers();
    }
    hide() {
        this.currentOptions = null;
        this.notifySubscribers();
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.currentOptions));
    }
}
exports.confirmationManager = ConfirmationManager.getInstance();
