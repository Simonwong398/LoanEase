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
exports.calculationOptimizer = void 0;
const batchProcessor_1 = require("./batchProcessor");
const memoryManager_1 = require("./memoryManager");
const performanceMonitor_1 = require("./performanceMonitor");
class CalculationOptimizer {
    constructor(config = {}) {
        this.cache = new Map();
        this.config = Object.assign({ useWorker: true, cacheResults: true, batchProcessing: true, memoryAware: true }, config);
        // 注册内存清理回调
        if (this.config.memoryAware) {
            memoryManager_1.memoryManager.onCleanup(() => this.clearCache());
        }
    }
    process(items_1, processor_1) {
        return __awaiter(this, arguments, void 0, function* (items, processor, options = {}) {
            var _a;
            const startTime = performance.now();
            try {
                // 检查缓存
                if (this.config.cacheResults && options.key) {
                    const cached = this.cache.get(options.key);
                    if (cached) {
                        return cached;
                    }
                }
                // 检查内存状态
                if (this.config.memoryAware && memoryManager_1.memoryManager.shouldDefer()) {
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
                let results;
                if (this.config.batchProcessing) {
                    // 使用批处理
                    results = yield batchProcessor_1.batchProcessor.processBatch(items, processor, options.progress);
                }
                else {
                    // 直接处理
                    results = yield processor(items);
                }
                // 缓存结果
                if (this.config.cacheResults && options.key) {
                    this.cache.set(options.key, results);
                }
                const endTime = performance.now();
                performanceMonitor_1.performanceMonitor.recordMetrics('calculation', {
                    operationTime: endTime - startTime,
                    memoryUsage: ((_a = process.memoryUsage) === null || _a === void 0 ? void 0 : _a.call(process).heapUsed) || 0,
                });
                return results;
            }
            catch (error) {
                console.error('Calculation failed:', error);
                throw error;
            }
        });
    }
    clearCache() {
        this.cache.clear();
    }
    updateConfig(config) {
        this.config = Object.assign(Object.assign({}, this.config), config);
    }
}
exports.calculationOptimizer = new CalculationOptimizer();
