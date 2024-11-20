"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculationProgressManager = void 0;
class CalculationProgressManager {
    constructor() {
        this.callbacks = new Set();
        this.currentProgress = null;
        this.startTime = 0;
    }
    static getInstance() {
        if (!CalculationProgressManager.instance) {
            CalculationProgressManager.instance = new CalculationProgressManager();
        }
        return CalculationProgressManager.instance;
    }
    subscribe(callback) {
        this.callbacks.add(callback);
        if (this.currentProgress) {
            callback(this.currentProgress);
        }
        return () => this.callbacks.delete(callback);
    }
    startCalculation(totalItems, batchSize) {
        this.startTime = Date.now();
        this.currentProgress = {
            totalItems,
            completedItems: 0,
            currentBatch: 0,
            totalBatches: Math.ceil(totalItems / batchSize),
            estimatedTimeRemaining: 0,
            stage: 'initialization',
            status: 'processing',
        };
        this.notifySubscribers();
    }
    updateProgress(completedItems, stage) {
        if (!this.currentProgress)
            return;
        const elapsedTime = Date.now() - this.startTime;
        const itemsPerMs = completedItems / elapsedTime;
        const remainingItems = this.currentProgress.totalItems - completedItems;
        const estimatedTimeRemaining = remainingItems / itemsPerMs;
        this.currentProgress = Object.assign(Object.assign({}, this.currentProgress), { completedItems,
            estimatedTimeRemaining,
            stage, currentBatch: Math.floor(completedItems / (this.currentProgress.totalItems / this.currentProgress.totalBatches)) });
        this.notifySubscribers();
    }
    completeCalculation() {
        if (this.currentProgress) {
            this.currentProgress.status = 'completed';
            this.currentProgress.completedItems = this.currentProgress.totalItems;
            this.currentProgress.estimatedTimeRemaining = 0;
            this.notifySubscribers();
        }
    }
    setError(error) {
        if (this.currentProgress) {
            this.currentProgress.status = 'error';
            this.notifySubscribers();
        }
    }
    notifySubscribers() {
        if (this.currentProgress) {
            this.callbacks.forEach(callback => callback(this.currentProgress));
        }
    }
    reset() {
        this.currentProgress = null;
        this.startTime = 0;
    }
}
exports.calculationProgressManager = CalculationProgressManager.getInstance();
