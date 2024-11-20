"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchProcessor = exports.BatchProcessor = void 0;
const performanceMonitor_1 = require("./performanceMonitor");
class BatchProcessor {
    constructor(config = {}) {
        this.metrics = [];
        this.config = Object.assign({ batchSize: 1000, maxBatchSize: 5000, minBatchSize: 100, targetProcessingTime: 16, adaptiveThreshold: 0.2 }, config);
        this.currentBatchSize = this.config.batchSize;
    }
    processBatch(items, processor, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const results = [];
            const totalItems = items.length;
            let processedItems = 0;
            while (processedItems < totalItems) {
                const batchStart = processedItems;
                const batchEnd = Math.min(batchStart + this.currentBatchSize, totalItems);
                const batch = items.slice(batchStart, batchEnd);
                const startTime = performance.now();
                const startMemory = ((_a = process.memoryUsage) === null || _a === void 0 ? void 0 : _a.call(process).heapUsed) || 0;
                try {
                    const batchResults = yield processor(batch);
                    results.push(...batchResults);
                    const endTime = performance.now();
                    const endMemory = ((_b = process.memoryUsage) === null || _b === void 0 ? void 0 : _b.call(process).heapUsed) || 0;
                    this.recordMetrics({
                        processingTime: endTime - startTime,
                        batchSize: batch.length,
                        itemCount: batchResults.length,
                        memoryUsage: endMemory - startMemory,
                    });
                    this.adjustBatchSize();
                    processedItems += batch.length;
                    if (onProgress) {
                        onProgress(processedItems / totalItems);
                    }
                }
                catch (error) {
                    // 如果处理失败，减小批次大小并重试
                    this.currentBatchSize = Math.max(Math.floor(this.currentBatchSize * 0.5), this.config.minBatchSize);
                    console.warn(`Batch processing failed, reducing batch size to ${this.currentBatchSize}`);
                    continue;
                }
            }
            return results;
        });
    }
    recordMetrics(metrics) {
        this.metrics.push(metrics);
        if (this.metrics.length > 100) {
            this.metrics.shift(); // 保持最近100个批次的指标
        }
        performanceMonitor_1.performanceMonitor.recordMetrics('batchProcessing', {
            operationTime: metrics.processingTime,
            memoryUsage: metrics.memoryUsage,
        });
    }
    adjustBatchSize() {
        if (this.metrics.length < 5)
            return; // 需要足够的样本
        const recentMetrics = this.metrics.slice(-5);
        const avgProcessingTime = recentMetrics.reduce((sum, m) => sum + m.processingTime, 0) / recentMetrics.length;
        const deviation = Math.abs(avgProcessingTime - this.config.targetProcessingTime)
            / this.config.targetProcessingTime;
        if (deviation > this.config.adaptiveThreshold) {
            if (avgProcessingTime > this.config.targetProcessingTime) {
                // 处理时间过长，减小批次大小
                this.currentBatchSize = Math.max(Math.floor(this.currentBatchSize * 0.8), this.config.minBatchSize);
            }
            else {
                // 处理时间较短，增加批次大小
                this.currentBatchSize = Math.min(Math.floor(this.currentBatchSize * 1.2), this.config.maxBatchSize);
            }
        }
    }
    getMetrics() {
        return [...this.metrics];
    }
    getCurrentBatchSize() {
        return this.currentBatchSize;
    }
    reset() {
        this.currentBatchSize = this.config.batchSize;
        this.metrics = [];
    }
}
exports.BatchProcessor = BatchProcessor;
exports.batchProcessor = new BatchProcessor();
