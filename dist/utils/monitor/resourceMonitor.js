"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.resourceMonitor = void 0;
const logger_1 = require("../logger");
const baseMonitor_1 = require("./baseMonitor");
const perf_hooks_1 = require("perf_hooks");
const os = __importStar(require("os"));
class ResourceMonitor extends baseMonitor_1.BaseMonitor {
    constructor() {
        super();
        this.thresholds = {
            memory: {
                heapUsedPercent: 85,
                rssPercent: 90,
            },
            cpu: {
                usagePercent: 80,
            },
            eventLoop: {
                maxLatency: 100,
            },
        };
        this.lastCPUUsage = null;
        this.lastGCStats = {
            collections: 0,
            duration: 0,
        };
        this.monitorInterval = null;
        this.MONITOR_INTERVAL = 5000;
        this.startMonitoring();
    }
    static getInstance() {
        if (!ResourceMonitor.instance) {
            ResourceMonitor.instance = new ResourceMonitor();
        }
        return ResourceMonitor.instance;
    }
    startMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        this.monitorInterval = setInterval(() => {
            this.collectMetrics().catch(error => {
                logger_1.logger.error('ResourceMonitor', 'Failed to collect metrics', error);
            });
        }, this.MONITOR_INTERVAL);
        if (global.gc) {
            global.gc.on('stats', (stats) => {
                this.lastGCStats = {
                    collections: stats.collections,
                    duration: stats.duration,
                };
            });
        }
    }
    collectMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = yield this.gatherResourceMetrics();
            this.record(metrics);
            this.checkThresholds(metrics);
        });
    }
    gatherResourceMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage(this.lastCPUUsage || undefined);
            this.lastCPUUsage = cpuUsage;
            const eventLoopLag = yield this.measureEventLoopLag();
            return {
                timestamp: Date.now(),
                memory: {
                    heapUsed: memoryUsage.heapUsed,
                    heapTotal: memoryUsage.heapTotal,
                    external: memoryUsage.external,
                    arrayBuffers: memoryUsage.arrayBuffers || 0,
                    rss: memoryUsage.rss,
                },
                cpu: {
                    usage: (cpuUsage.user + cpuUsage.system) / 1000000,
                    userTime: cpuUsage.user / 1000000,
                    systemTime: cpuUsage.system / 1000000,
                },
                eventLoop: {
                    latency: eventLoopLag,
                    lag: eventLoopLag - this.MONITOR_INTERVAL,
                },
                gc: Object.assign(Object.assign({}, this.lastGCStats), { type: 'unknown' }),
            };
        });
    }
    measureEventLoopLag() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = perf_hooks_1.performance.now();
            return new Promise(resolve => {
                setImmediate(() => {
                    resolve(perf_hooks_1.performance.now() - start);
                });
            });
        });
    }
    checkThresholds(metrics) {
        const heapUsedPercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
        const rssPercent = (metrics.memory.rss / (os.totalmem() * 0.8)) * 100;
        if (heapUsedPercent > this.thresholds.memory.heapUsedPercent) {
            logger_1.logger.warn('ResourceMonitor', 'High heap memory usage', {
                used: heapUsedPercent.toFixed(2) + '%',
                threshold: this.thresholds.memory.heapUsedPercent + '%',
            });
        }
        if (rssPercent > this.thresholds.memory.rssPercent) {
            logger_1.logger.warn('ResourceMonitor', 'High RSS memory usage', {
                used: rssPercent.toFixed(2) + '%',
                threshold: this.thresholds.memory.rssPercent + '%',
            });
        }
        const cpuPercent = (metrics.cpu.usage / (this.MONITOR_INTERVAL / 1000)) * 100;
        if (cpuPercent > this.thresholds.cpu.usagePercent) {
            logger_1.logger.warn('ResourceMonitor', 'High CPU usage', {
                used: cpuPercent.toFixed(2) + '%',
                threshold: this.thresholds.cpu.usagePercent + '%',
            });
        }
        if (metrics.eventLoop.latency > this.thresholds.eventLoop.maxLatency) {
            logger_1.logger.warn('ResourceMonitor', 'High event loop latency', {
                latency: metrics.eventLoop.latency.toFixed(2) + 'ms',
                threshold: this.thresholds.eventLoop.maxLatency + 'ms',
            });
        }
    }
    getResourceTrends() {
        return __awaiter(this, arguments, void 0, function* (timeWindow = 3600000) {
            const endTime = Date.now();
            const startTime = endTime - timeWindow;
            const metrics = this.getEntries({
                startTime,
                endTime,
            });
            return {
                memory: metrics.map(m => ({
                    timestamp: m.timestamp,
                    used: m.memory.heapUsed,
                })),
                cpu: metrics.map(m => ({
                    timestamp: m.timestamp,
                    usage: m.cpu.usage,
                })),
                eventLoop: metrics.map(m => ({
                    timestamp: m.timestamp,
                    latency: m.eventLoop.latency,
                })),
            };
        });
    }
    dispose() {
        this.onDispose();
        super.dispose();
    }
    getMonitorName() {
        return 'ResourceMonitor';
    }
    performCustomCleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;
        this.entries = this.entries.filter(entry => now - entry.timestamp < maxAge);
    }
    onRecordComplete(metrics) {
        this.checkThresholds(metrics);
    }
    filterByTimeRange(entries, startTime, endTime) {
        return entries.filter(entry => {
            if (startTime && entry.timestamp < startTime)
                return false;
            if (endTime && entry.timestamp > endTime)
                return false;
            return true;
        });
    }
    filterByCategories(entries, categories) {
        return entries;
    }
    filterByStatuses(entries, statuses) {
        return entries;
    }
    calculateStats(timeWindow) {
        const relevantEntries = timeWindow
            ? this.filterByTimeRange(this.entries, Date.now() - timeWindow)
            : this.entries;
        const total = relevantEntries.length;
        const warningThreshold = this.thresholds.memory.heapUsedPercent;
        const warnings = relevantEntries.filter(entry => (entry.memory.heapUsed / entry.memory.heapTotal) * 100 > warningThreshold).length;
        return {
            total,
            success: total - warnings,
            error: 0,
            warning: warnings,
            avgDuration: undefined
        };
    }
    onDispose() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.lastCPUUsage = null;
        this.lastGCStats = { collections: 0, duration: 0 };
    }
    onClear() {
        this.lastCPUUsage = null;
        this.lastGCStats = { collections: 0, duration: 0 };
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.startMonitoring();
        logger_1.logger.info('ResourceMonitor', 'Monitor state cleared and restarted');
    }
}
ResourceMonitor.instance = null;
exports.resourceMonitor = ResourceMonitor.getInstance();
