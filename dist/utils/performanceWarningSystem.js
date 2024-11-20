"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceWarningSystem = void 0;
const performanceMetrics_1 = require("./performanceMetrics");
class PerformanceWarningSystem {
    constructor() {
        this.warnings = [];
        this.listeners = new Set();
        this.thresholds = [
            { metric: 'calculationTime', warning: 1000, critical: 3000 },
            { metric: 'memoryUsage', warning: 0.7, critical: 0.9 },
            { metric: 'cacheHitRate', warning: 0.4, critical: 0.2 },
            { metric: 'batchLatency', warning: 200, critical: 500 },
            { metric: 'cpuUsage', warning: 0.7, critical: 0.9 },
        ];
        this.startMonitoring();
    }
    static getInstance() {
        if (!PerformanceWarningSystem.instance) {
            PerformanceWarningSystem.instance = new PerformanceWarningSystem();
        }
        return PerformanceWarningSystem.instance;
    }
    startMonitoring() {
        setInterval(() => {
            const metrics = performanceMetrics_1.performanceMetricsCollector.getMetrics();
            this.checkThresholds(metrics);
        }, 5000);
    }
    checkThresholds(metrics) {
        this.thresholds.forEach(threshold => {
            const value = metrics[threshold.metric];
            if (value >= threshold.critical) {
                this.addWarning({
                    id: `${threshold.metric}_${Date.now()}`,
                    metric: threshold.metric,
                    level: 'critical',
                    value,
                    threshold: threshold.critical,
                    timestamp: Date.now(),
                    message: this.generateWarningMessage(threshold.metric, value, 'critical'),
                });
            }
            else if (value >= threshold.warning) {
                this.addWarning({
                    id: `${threshold.metric}_${Date.now()}`,
                    metric: threshold.metric,
                    level: 'warning',
                    value,
                    threshold: threshold.warning,
                    timestamp: Date.now(),
                    message: this.generateWarningMessage(threshold.metric, value, 'warning'),
                });
            }
        });
    }
    generateWarningMessage(metric, value, level) {
        const formattedValue = value.toFixed(2);
        switch (metric) {
            case 'calculationTime':
                return `计算时间${level === 'critical' ? '严重' : ''}过长: ${formattedValue}ms`;
            case 'memoryUsage':
                return `内存使用率${level === 'critical' ? '严重' : ''}过高: ${(value * 100).toFixed(1)}%`;
            case 'cacheHitRate':
                return `缓存命中率${level === 'critical' ? '严重' : ''}过低: ${(value * 100).toFixed(1)}%`;
            case 'batchLatency':
                return `批处理延迟${level === 'critical' ? '严重' : ''}过高: ${formattedValue}ms`;
            case 'cpuUsage':
                return `CPU使用率${level === 'critical' ? '严重' : ''}过高: ${(value * 100).toFixed(1)}%`;
            default:
                return `${metric}性能${level === 'critical' ? '严重' : ''}异常: ${formattedValue}`;
        }
    }
    addWarning(warning) {
        this.warnings.push(warning);
        // 只保留最近的100条警告
        if (this.warnings.length > 100) {
            this.warnings.shift();
        }
        this.notifyListeners();
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.getWarnings()));
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    getWarnings(timeWindow = 3600000) {
        const cutoff = Date.now() - timeWindow;
        return this.warnings.filter(w => w.timestamp >= cutoff);
    }
    clearWarnings() {
        this.warnings = [];
        this.notifyListeners();
    }
}
exports.performanceWarningSystem = PerformanceWarningSystem.getInstance();
