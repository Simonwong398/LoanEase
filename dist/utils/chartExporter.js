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
exports.chartExporter = void 0;
const errors_1 = require("../types/errors");
const timeoutHandler_1 = require("../utils/timeoutHandler");
const auditManager_1 = require("./auditManager");
const index_1 = require("../utils/security/index");
const concurrency_1 = require("./concurrency");
const timeout_1 = require("./timeout");
const logger_1 = require("./logger");
const DEFAULT_EXPORT_OPTIONS = {
    format: 'png'
};
class ChartExporter {
    constructor() {
        this.concurrencyManager = new concurrency_1.ConcurrencyManager(2);
        this.cache = new Map();
        this.cleanupInterval = null;
        this.isDisposed = false;
        this.activeExports = new Set();
        this.exportQueue = [];
        this.startCleanupSchedule();
    }
    static getInstance() {
        if (!ChartExporter.instance) {
            ChartExporter.instance = new ChartExporter();
        }
        return ChartExporter.instance;
    }
    startCleanupSchedule() {
        // 每小时清理一次缓存
        this.cleanupInterval = setInterval(() => {
            this.cleanCache().catch(error => {
                console.error('Cache cleanup failed:', error);
            });
        }, 60 * 60 * 1000);
    }
    // 只保留一个异步的 cleanCache 实现
    cleanCache() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug('ChartExporter', 'Starting cache cleanup');
            return (0, timeoutHandler_1.withTimeoutSignal)((signal) => __awaiter(this, void 0, void 0, function* () {
                const now = Date.now();
                const entries = Array.from(this.cache.entries());
                for (const [key, value] of entries) {
                    if (signal.aborted) {
                        break;
                    }
                    if (now - value.timestamp > ChartExporter.CACHE_TTL) {
                        this.cache.delete(key);
                    }
                }
                logger_1.logger.info('ChartExporter', 'Cache cleanup completed');
            }), ChartExporter.CACHE_CLEANUP_TIMEOUT, 'Cache cleanup');
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDisposed) {
                return;
            }
            this.isDisposed = true;
            try {
                // 清理定时器
                if (this.cleanupInterval) {
                    clearInterval(this.cleanupInterval);
                    this.cleanupInterval = null;
                }
                // 等待所有活动导出完成
                yield Promise.all(Array.from(this.activeExports));
                // 清理缓存
                this.cache.clear();
                this.activeExports.clear();
                yield auditManager_1.auditManager.logEvent({
                    type: 'chart',
                    action: 'dispose',
                    status: 'success',
                    details: { timestamp: Date.now() }
                });
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'chart',
                    action: 'dispose',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
                throw error;
            }
        });
    }
    getCachedResult(key_1, generator_1) {
        return __awaiter(this, arguments, void 0, function* (key, generator, format = 'png') {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < ChartExporter.CACHE_TTL) {
                return cached.data;
            }
            const data = yield generator();
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                format
            });
            return data;
        });
    }
    exportChart(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, options = {}) {
            var _a, _b, _c, _d;
            logger_1.logger.info('ChartExporter', 'Starting chart export', { options });
            // 创建完整的选项对象，确保所有必需的属性都有值
            const fullOptions = {
                format: options.format || 'png', // 提供默认值
                quality: (_a = options.quality) !== null && _a !== void 0 ? _a : 1,
                width: (_b = options.width) !== null && _b !== void 0 ? _b : 300,
                height: (_c = options.height) !== null && _c !== void 0 ? _c : 200,
                scale: (_d = options.scale) !== null && _d !== void 0 ? _d : 1,
            };
            return this.concurrencyManager.add(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield (0, timeout_1.withTimeout)(this._exportChart(data, fullOptions), // 使用完整的选项对象
                    ChartExporter.EXPORT_TIMEOUT, 'Chart export');
                    logger_1.logger.info('ChartExporter', 'Chart export completed');
                }
                catch (error) {
                    logger_1.logger.error('ChartExporter', 'Chart export failed', error instanceof Error ? error : new Error(String(error)));
                    throw error;
                }
            }));
        });
    }
    sanitizeOptions(options) {
        const format = options.format || 'png';
        if (!['png', 'jpeg', 'pdf'].includes(format)) {
            throw new errors_1.ValidationError('Invalid export format');
        }
        return {
            format,
            quality: options.quality ? Math.min(Math.max(Number(options.quality), 0), 1) : 1,
            width: options.width ? Math.max(Number(options.width), 0) : 300,
            height: options.height ? Math.max(Number(options.height), 0) : 200,
            scale: options.scale ? Math.max(Number(options.scale), 1) : 1,
        };
    }
    sanitizeChartData(data) {
        var _a;
        if (!data || typeof data !== 'object') {
            throw new errors_1.ValidationError('Invalid chart data format');
        }
        const unvalidatedData = data;
        return {
            labels: ((_a = unvalidatedData.labels) === null || _a === void 0 ? void 0 : _a.map((label) => (0, index_1.sanitizeData)(label))) || [],
            datasets: (unvalidatedData.datasets || []).map(dataset => ({
                data: (dataset.data || []).map(value => Number(value)),
                label: (0, index_1.sanitizeData)(dataset.label),
                color: dataset.color ? (0, index_1.sanitizeData)(dataset.color) : undefined
            }))
        };
    }
    _exportChart(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // 原有的 exportChart 实现
        });
    }
    processExportQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.exportQueue.length > 0) {
                const batch = this.exportQueue.splice(0, 3); // 每次处理3个任务
                yield Promise.all(batch.map((task) => this.concurrencyManager.add(task)));
            }
        });
    }
    warmupCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const commonFormats = ['png', 'jpeg', 'pdf'];
            yield Promise.all(commonFormats.map(format => this.getCachedResult(`template_${format}`, () => __awaiter(this, void 0, void 0, function* () { return ({}); }), format)));
        });
    }
}
ChartExporter.EXPORT_TIMEOUT = 15000; // 15 seconds
ChartExporter.CACHE_CLEANUP_TIMEOUT = 5000; // 5 seconds
ChartExporter.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
ChartExporter.instance = null;
exports.chartExporter = ChartExporter.getInstance();
