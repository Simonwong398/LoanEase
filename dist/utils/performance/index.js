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
exports.performanceManager = void 0;
const logger_1 = require("../logger");
const resourceMonitor_1 = require("../monitor/resourceMonitor");
class PerformanceManager {
    constructor() {
        this.metrics = [];
        this.maxMetrics = 10000;
        this.cleanupInterval = 24 * 60 * 60 * 1000; // 24小时
        this.cleanupTimer = null;
        this.thresholds = {
            network: {
                request: 500, // 500ms
                response: 1000, // 1s
                timeout: 5000 // 5s
            },
            render: {
                firstPaint: 1000, // 1s
                firstContentfulPaint: 1500, // 1.5s
                largeContentfulPaint: 2500 // 2.5s
            },
            computation: {
                taskDuration: 100, // 100ms
                idleTimeout: 50 // 50ms
            },
            database: {
                queryTime: 200, // 200ms
                connectionTime: 100 // 100ms
            },
            cache: {
                hitRatio: 0.8, // 80%
                maxAge: 3600000 // 1小时
            }
        };
        this.startCleanup();
    }
    static getInstance() {
        if (!PerformanceManager.instance) {
            PerformanceManager.instance = new PerformanceManager();
        }
        return PerformanceManager.instance;
    }
    // 记录性能指标
    recordMetric(type, name, duration, context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resourceMetrics = yield resourceMonitor_1.resourceMonitor.getResourceTrends(1000);
                const lastMetric = resourceMetrics.cpu[resourceMetrics.cpu.length - 1];
                const metric = {
                    timestamp: Date.now(),
                    type,
                    name,
                    duration,
                    success: this.isWithinThreshold(type, duration),
                    context,
                    resourceUsage: lastMetric ? {
                        memory: resourceMetrics.memory[resourceMetrics.memory.length - 1].used,
                        cpu: lastMetric.usage
                    } : undefined
                };
                this.metrics.push(metric);
                this.checkMetricsSize();
                this.analyzeMetric(metric);
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('PerformanceManager', 'Failed to record metric', actualError);
            }
        });
    }
    // 性能测量装饰器
    measure(type, name) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            const metricName = name || `${target.constructor.name}.${propertyKey}`;
            descriptor.value = function (...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    const start = performance.now();
                    try {
                        const result = yield originalMethod.apply(this, args);
                        const duration = performance.now() - start;
                        yield exports.performanceManager.recordMetric(type, metricName, duration, {
                            args: args.map(arg => typeof arg === 'object' ? Object.keys(arg) : typeof arg)
                        });
                        return result;
                    }
                    catch (error) {
                        const duration = performance.now() - start;
                        yield exports.performanceManager.recordMetric(type, metricName, duration, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                        throw error;
                    }
                });
            };
            return descriptor;
        };
    }
    // 分析性能指标
    analyzeMetric(metric) {
        if (!metric.success) {
            logger_1.logger.warn('PerformanceManager', 'Performance threshold exceeded', {
                type: metric.type,
                name: metric.name,
                duration: metric.duration,
                threshold: this.getThreshold(metric.type, metric.name)
            });
            // 检查资源使用情况
            if (metric.resourceUsage) {
                const { memory, cpu } = metric.resourceUsage;
                if (cpu > 80) { // CPU 使用率超过 80%
                    logger_1.logger.warn('PerformanceManager', 'High CPU usage detected', {
                        cpu,
                        metric: metric.name
                    });
                }
                if (memory > 1024 * 1024 * 1024) { // 内存使用超过 1GB
                    logger_1.logger.warn('PerformanceManager', 'High memory usage detected', {
                        memory: Math.round(memory / 1024 / 1024) + 'MB',
                        metric: metric.name
                    });
                }
            }
        }
    }
    // 获取性能分析报告
    getPerformanceReport(timeWindow) {
        return __awaiter(this, void 0, void 0, function* () {
            const relevantMetrics = timeWindow
                ? this.metrics.filter(m => Date.now() - m.timestamp < timeWindow)
                : this.metrics;
            // 计算基本统计信息
            const totalMetrics = relevantMetrics.length;
            const successfulMetrics = relevantMetrics.filter(m => m.success);
            const durations = relevantMetrics.map(m => m.duration).sort((a, b) => a - b);
            const p95Index = Math.floor(durations.length * 0.95);
            // 计算资源使用情况
            const resourceMetrics = relevantMetrics
                .filter(m => m.resourceUsage)
                .map(m => m.resourceUsage);
            // 按类型分组
            const metricsByType = this.groupMetricsByType(relevantMetrics);
            // 查找最慢的操作
            const slowestOps = this.findSlowestOperations(relevantMetrics);
            // 生成优化建议
            const recommendations = this.generateRecommendations(relevantMetrics, metricsByType, slowestOps);
            return {
                summary: {
                    totalMetrics,
                    successRate: successfulMetrics.length / totalMetrics,
                    avgDuration: durations.reduce((a, b) => a + b, 0) / totalMetrics,
                    p95Duration: durations[p95Index],
                    resourceUsage: {
                        avgCpu: this.average(resourceMetrics.map(r => r.cpu)),
                        avgMemory: this.average(resourceMetrics.map(r => r.memory)),
                        peakCpu: Math.max(...resourceMetrics.map(r => r.cpu)),
                        peakMemory: Math.max(...resourceMetrics.map(r => r.memory))
                    }
                },
                byType: metricsByType,
                slowestOperations: slowestOps,
                recommendations
            };
        });
    }
    isWithinThreshold(type, duration) {
        const threshold = this.getThreshold(type);
        return duration <= threshold;
    }
    getThreshold(type, name) {
        // 可以根据具体的 name 返回更细粒度的阈值
        switch (type) {
            case 'network':
                return this.thresholds.network.response;
            case 'render':
                return this.thresholds.render.firstContentfulPaint;
            case 'computation':
                return this.thresholds.computation.taskDuration;
            case 'database':
                return this.thresholds.database.queryTime;
            case 'cache':
                return 50; // 50ms
            default:
                return 1000; // 默 1s
        }
    }
    startCleanup() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }
    cleanup() {
        const now = Date.now();
        this.metrics = this.metrics.filter(metric => now - metric.timestamp < this.cleanupInterval);
    }
    checkMetricsSize() {
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }
    average(numbers) {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }
    groupMetricsByType(metrics) {
        const result = {};
        const types = new Set(metrics.map(m => m.type));
        types.forEach(type => {
            const typeMetrics = metrics.filter(m => m.type === type);
            const durations = typeMetrics.map(m => m.duration).sort((a, b) => a - b);
            const p95Index = Math.floor(durations.length * 0.95);
            result[type] = {
                count: typeMetrics.length,
                successRate: typeMetrics.filter(m => m.success).length / typeMetrics.length,
                avgDuration: this.average(durations),
                p95Duration: durations[p95Index]
            };
        });
        return result;
    }
    findSlowestOperations(metrics) {
        const operationStats = new Map();
        metrics.forEach(metric => {
            const key = `${metric.type}:${metric.name}`;
            const stats = operationStats.get(key) || { type: metric.type, durations: [] };
            stats.durations.push(metric.duration);
            operationStats.set(key, stats);
        });
        return Array.from(operationStats.entries())
            .map(([key, stats]) => ({
            name: key.split(':')[1],
            type: stats.type,
            avgDuration: this.average(stats.durations),
            count: stats.durations.length
        }))
            .sort((a, b) => b.avgDuration - a.avgDuration)
            .slice(0, 10);
    }
    generateRecommendations(metrics, metricsByType, slowestOps) {
        const recommendations = [];
        // 检查整体性能
        const overallSuccessRate = metrics.filter(m => m.success).length / metrics.length;
        if (overallSuccessRate < 0.95) {
            recommendations.push(`Overall success rate (${(overallSuccessRate * 100).toFixed(1)}%) is below target (95%). Consider reviewing error handling and retry mechanisms.`);
        }
        // 检查各类型性能
        Object.entries(metricsByType).forEach(([type, stats]) => {
            if (stats.successRate < 0.95) {
                recommendations.push(`${type} operations have low success rate (${(stats.successRate * 100).toFixed(1)}%). Review error handling and optimization opportunities.`);
            }
        });
        // 检查最慢操作
        slowestOps.forEach(op => {
            const threshold = this.getThreshold(op.type);
            if (op.avgDuration > threshold) {
                recommendations.push(`Operation "${op.name}" (${op.type}) is consistently slow (avg: ${op.avgDuration.toFixed(1)}ms, threshold: ${threshold}ms). Consider optimization or caching.`);
            }
        });
        return recommendations;
    }
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.metrics = [];
    }
}
PerformanceManager.instance = null;
exports.performanceManager = PerformanceManager.getInstance();
