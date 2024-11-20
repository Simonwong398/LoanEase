"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMetricsCollector = void 0;
class PerformanceMetricsCollector {
    constructor() {
        this.metrics = this.initializeMetrics();
        this.startTime = Date.now();
        this.operationCount = 0;
        this.responseTimes = [];
        this.RESPONSE_TIME_WINDOW = 1000; // 保留最近1000个响应时间样本
        this.startPerformanceMonitoring();
    }
    static getInstance() {
        if (!PerformanceMetricsCollector.instance) {
            PerformanceMetricsCollector.instance = new PerformanceMetricsCollector();
        }
        return PerformanceMetricsCollector.instance;
    }
    initializeMetrics() {
        return {
            calculationTime: 0,
            operationsPerSecond: 0,
            cacheHitRate: 0,
            memoryUsage: 0,
            peakMemoryUsage: 0,
            gcCollections: 0,
            heapSize: 0,
            avgBatchSize: 0,
            batchThroughput: 0,
            batchLatency: 0,
            batchSuccessRate: 0,
            cpuUsage: 0,
            threadCount: 1,
            ioOperations: 0,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            errorRate: 0,
            cacheSize: 0,
            cacheEvictions: 0,
            cacheMissRate: 0,
            pendingOperations: 0,
            concurrentOperations: 0,
            operationQueueLength: 0,
            networkLatency: 0,
            networkThroughput: 0,
            activeConnections: 0,
        };
    }
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updateMetrics();
        }, 1000);
    }
    updateMetrics() {
        var _a;
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000;
        // 更新基础指标
        this.metrics.operationsPerSecond = this.operationCount / elapsedTime;
        this.metrics.memoryUsage = this.getMemoryUsage();
        this.metrics.cpuUsage = this.getCPUUsage();
        // 更新响应时间指标
        if (this.responseTimes.length > 0) {
            const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
            this.metrics.averageResponseTime = sortedTimes.reduce((a, b) => a + b) / sortedTimes.length;
            this.metrics.p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
            this.metrics.p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
        }
        // 更新内存指标
        if (typeof window !== 'undefined' && ((_a = window.performance) === null || _a === void 0 ? void 0 : _a.memory)) {
            this.metrics.heapSize = window.performance.memory.totalJSHeapSize;
            this.metrics.peakMemoryUsage = Math.max(this.metrics.peakMemoryUsage, window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit);
        }
        // 更新缓存指标
        this.metrics.cacheMissRate = 1 - this.metrics.cacheHitRate;
    }
    recordOperation(type, duration, success = true) {
        this.operationCount++;
        this.metrics.calculationTime += duration;
        this.responseTimes.push(duration);
        // 保持响应时间窗口大小
        if (this.responseTimes.length > this.RESPONSE_TIME_WINDOW) {
            this.responseTimes.shift();
        }
        // 更新错误率
        const totalOps = this.operationCount;
        const errorOps = this.metrics.errorRate * (totalOps - 1) + (success ? 0 : 1);
        this.metrics.errorRate = errorOps / totalOps;
        if (duration > 100) {
            console.warn(`Long operation detected: ${type} took ${duration}ms`);
        }
    }
    recordBatch(size, duration, successCount) {
        this.metrics.avgBatchSize = (this.metrics.avgBatchSize + size) / 2;
        this.metrics.batchThroughput = size / (duration / 1000);
        this.metrics.batchLatency = duration / size;
        this.metrics.batchSuccessRate = successCount / size;
    }
    recordCacheOperation(hit, size, evicted) {
        this.metrics.cacheHitRate = hit ?
            (this.metrics.cacheHitRate * this.operationCount + 1) / (this.operationCount + 1) :
            (this.metrics.cacheHitRate * this.operationCount) / (this.operationCount + 1);
        this.metrics.cacheSize = size;
        if (evicted) {
            this.metrics.cacheEvictions++;
        }
    }
    recordAsyncOperation(pending, concurrent, queueLength) {
        this.metrics.pendingOperations = pending;
        this.metrics.concurrentOperations = concurrent;
        this.metrics.operationQueueLength = queueLength;
    }
    recordNetworkMetrics(latency, throughput, connections) {
        this.metrics.networkLatency = latency;
        this.metrics.networkThroughput = throughput;
        this.metrics.activeConnections = connections;
    }
    getMetrics() {
        return Object.assign({}, this.metrics);
    }
    reset() {
        this.metrics = this.initializeMetrics();
        this.startTime = Date.now();
        this.operationCount = 0;
        this.responseTimes = [];
    }
    getMemoryUsage() {
        var _a;
        if (typeof window !== 'undefined' && ((_a = window.performance) === null || _a === void 0 ? void 0 : _a.memory)) {
            return window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit;
        }
        return 0;
    }
    getCPUUsage() {
        return Math.min(this.metrics.operationsPerSecond / 1000, 1);
    }
}
exports.performanceMetricsCollector = PerformanceMetricsCollector.getInstance();
