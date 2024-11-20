"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = exports.performanceMonitor = exports.memoryMonitor = void 0;
const logger_1 = require("../logger");
const react_1 = __importDefault(require("react"));
class MemoryMonitor {
    constructor() {
        this.snapshots = [];
        this.maxSnapshots = 100;
        this.monitorInterval = null;
        this.thresholds = {
            heapUsed: 100 * 1024 * 1024, // 100MB
            heapGrowthRate: 0.1, // 10%
        };
        this.startMonitoring();
    }
    static getInstance() {
        if (!MemoryMonitor.instance) {
            MemoryMonitor.instance = new MemoryMonitor();
        }
        return MemoryMonitor.instance;
    }
    startMonitoring() {
        this.monitorInterval = setInterval(() => {
            this.takeSnapshot();
            this.analyzeMemoryUsage();
        }, 60000); // 每分钟监控一次
    }
    takeSnapshot() {
        const memory = process.memoryUsage();
        const snapshot = {
            timestamp: Date.now(),
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
            external: memory.external,
            arrayBuffers: memory.arrayBuffers,
        };
        this.snapshots.push(snapshot);
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }
    }
    analyzeMemoryUsage() {
        if (this.snapshots.length < 2)
            return;
        const latest = this.snapshots[this.snapshots.length - 1];
        const previous = this.snapshots[this.snapshots.length - 2];
        // 检查内存使用量
        if (latest.heapUsed > this.thresholds.heapUsed) {
            logger_1.logger.warn('MemoryMonitor', 'High memory usage detected', {
                current: latest.heapUsed,
                threshold: this.thresholds.heapUsed,
            });
        }
        // 检查内存增长率
        const growthRate = (latest.heapUsed - previous.heapUsed) / previous.heapUsed;
        if (growthRate > this.thresholds.heapGrowthRate) {
            logger_1.logger.warn('MemoryMonitor', 'Rapid memory growth detected', {
                growthRate,
                threshold: this.thresholds.heapGrowthRate,
            });
        }
    }
    getSnapshots() {
        return [...this.snapshots];
    }
    dispose() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.snapshots = [];
    }
}
MemoryMonitor.instance = null;
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.maxMetrics = 1000;
        this.activeOperations = new Map();
        this.thresholds = {
            network: 1000, // 1秒
            render: 16, // 16ms
            computation: 100, // 100ms
            io: 500, // 500ms
        };
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    startOperation(name, type) {
        this.activeOperations.set(name, performance.now());
    }
    endOperation(name, type, metadata) {
        const startTime = this.activeOperations.get(name);
        if (!startTime)
            return;
        const duration = performance.now() - startTime;
        this.activeOperations.delete(name);
        const metric = {
            name,
            startTime,
            duration,
            type,
            metadata,
        };
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }
        // 检查性能问题
        if (duration > this.thresholds[type]) {
            logger_1.logger.warn('PerformanceMonitor', 'Performance threshold exceeded', {
                operation: name,
                type,
                duration,
                threshold: this.thresholds[type],
            });
        }
    }
    getMetrics(type) {
        return this.metrics
            .filter(metric => !type || metric.type === type)
            .slice();
    }
    setThreshold(type, threshold) {
        this.thresholds[type] = threshold;
    }
    clearMetrics() {
        this.metrics = [];
        this.activeOperations.clear();
    }
}
PerformanceMonitor.instance = null;
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        var _a, _b;
        logger_1.logger.error('ErrorBoundary', 'Component error caught', error, {
            componentStack: errorInfo.componentStack,
        });
        (_b = (_a = this.props).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
exports.memoryMonitor = MemoryMonitor.getInstance();
exports.performanceMonitor = PerformanceMonitor.getInstance();
