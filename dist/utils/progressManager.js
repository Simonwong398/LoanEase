"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressManager = void 0;
class ProgressManager {
    constructor() {
        this.callbacks = new Set();
        this.currentProgress = 0;
        this.currentMessage = '';
    }
    static getInstance() {
        if (!ProgressManager.instance) {
            ProgressManager.instance = new ProgressManager();
        }
        return ProgressManager.instance;
    }
    subscribe(callback) {
        this.callbacks.add(callback);
        // 立即发送当前进度
        callback(this.currentProgress, this.currentMessage);
        return () => this.callbacks.delete(callback);
    }
    updateProgress(progress, message) {
        this.currentProgress = progress;
        if (message)
            this.currentMessage = message;
        this.notifySubscribers();
    }
    notifySubscribers() {
        this.callbacks.forEach(callback => callback(this.currentProgress, this.currentMessage));
    }
    reset() {
        this.currentProgress = 0;
        this.currentMessage = '';
        this.notifySubscribers();
    }
}
exports.progressManager = ProgressManager.getInstance();
