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
exports.performanceTracker = void 0;
const performanceMonitor_1 = require("./performanceMonitor");
class PerformanceTracker {
    constructor() {
        this.thresholds = new Map();
        this.warnings = new Set();
        this.initializeThresholds();
    }
    static getInstance() {
        if (!PerformanceTracker.instance) {
            PerformanceTracker.instance = new PerformanceTracker();
        }
        return PerformanceTracker.instance;
    }
    initializeThresholds() {
        this.thresholds.set('calculation', 500); // 500ms
        this.thresholds.set('render', 16); // 16ms (60fps)
        this.thresholds.set('memory', 100 * 1024 * 1024); // 100MB
    }
    trackOperation(context, operation) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            const startMemory = this.getMemoryUsage();
            try {
                const result = yield operation();
                const metrics = {
                    operationTime: performance.now() - startTime,
                    memoryUsage: this.getMemoryUsage() - startMemory,
                };
                this.analyzeMetrics(context, metrics);
                return result;
            }
            catch (error) {
                this.recordError(context, error);
                throw error;
            }
        });
    }
    analyzeMetrics(context, metrics) {
        // 检查操作时间
        const timeThreshold = this.thresholds.get(context.operation) || 500;
        if (metrics.operationTime > timeThreshold) {
            this.addWarning(`${context.operation} took ${metrics.operationTime}ms (threshold: ${timeThreshold}ms)`);
        }
        // 检查内存使用
        const memoryThreshold = this.thresholds.get('memory');
        if (metrics.memoryUsage > memoryThreshold) {
            this.addWarning(`High memory usage in ${context.operation}: ${metrics.memoryUsage} bytes`);
        }
        // 记录指标
        performanceMonitor_1.performanceMonitor.recordMetrics(context.operation, metrics);
    }
    addWarning(message) {
        this.warnings.add(message);
        performanceMonitor_1.performanceMonitor.addWarning(message);
    }
    recordError(context, error) {
        performanceMonitor_1.performanceMonitor.recordError(error, {
            component: context.component,
            operation: context.operation,
        });
    }
    getMemoryUsage() {
        var _a;
        return ((_a = process.memoryUsage) === null || _a === void 0 ? void 0 : _a.call(process).heapUsed) || 0;
    }
    getWarnings() {
        return Array.from(this.warnings);
    }
    clearWarnings() {
        this.warnings.clear();
    }
    setThreshold(operation, value) {
        this.thresholds.set(operation, value);
    }
}
exports.performanceTracker = PerformanceTracker.getInstance();
