"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = void 0;
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.warnings = new Set();
        this.errors = [];
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    recordMetrics(operation, metrics) {
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        this.metrics.get(operation).push(metrics);
    }
    addWarning(message) {
        this.warnings.add(message);
    }
    recordError(error, context) {
        this.errors.push(error);
        // 可以添加更多错误处理逻辑
    }
    getMetrics(operation) {
        if (operation) {
            return this.metrics.get(operation) || [];
        }
        return Array.from(this.metrics.values()).flat();
    }
    getWarnings() {
        return Array.from(this.warnings);
    }
    getErrors() {
        return [...this.errors];
    }
    clearMetrics() {
        this.metrics.clear();
    }
    clearWarnings() {
        this.warnings.clear();
    }
    clearErrors() {
        this.errors = [];
    }
}
exports.performanceMonitor = PerformanceMonitor.getInstance();
