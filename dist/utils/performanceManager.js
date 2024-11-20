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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const auditManager_1 = require("./auditManager");
class PerformanceManager {
    constructor() {
        this.config = {
            enableOfflineMode: true,
            maxCacheSize: 50, // 50MB
            cacheDuration: 7 * 24 * 60 * 60 * 1000, // 7天
            batchSize: 100,
            networkTimeout: 10000, // 10秒
        };
        this.cache = new Map();
        this.currentCacheSize = 0;
        this.workerPool = [];
        this.isInitialized = false;
        this.initialize();
    }
    static getInstance() {
        if (!PerformanceManager.instance) {
            PerformanceManager.instance = new PerformanceManager();
        }
        return PerformanceManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isInitialized)
                return;
            try {
                // 加载缓存的数据
                yield this.loadCache();
                // 初始化 Web Worker 池
                this.initializeWorkerPool();
                this.isInitialized = true;
                yield auditManager_1.auditManager.logEvent({
                    type: 'performance',
                    action: 'initialize',
                    status: 'success',
                    details: { config: this.config },
                });
            }
            catch (error) {
                console.error('Failed to initialize performance manager:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'performance',
                    action: 'initialize',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    loadCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cacheData = yield async_storage_1.default.getItem('@performance_cache');
                if (cacheData) {
                    const parsed = JSON.parse(cacheData);
                    this.cache = new Map(parsed.cache);
                    this.currentCacheSize = parsed.size;
                }
            }
            catch (error) {
                console.error('Failed to load cache:', error);
            }
        });
    }
    saveCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cacheData = {
                    cache: Array.from(this.cache.entries()),
                    size: this.currentCacheSize,
                };
                yield async_storage_1.default.setItem('@performance_cache', JSON.stringify(cacheData));
            }
            catch (error) {
                console.error('Failed to save cache:', error);
            }
        });
    }
    initializeWorkerPool() {
        const workerCount = Math.max(1, navigator.hardwareConcurrency - 1);
        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker(new URL('../workers/calculationWorker.ts', import.meta.url));
            this.workerPool.push(worker);
        }
    }
    // 离线计算支持
    performOfflineCalculation(key, calculation, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(options === null || options === void 0 ? void 0 : options.force) && this.config.enableOfflineMode) {
                const cached = this.cache.get(key);
                if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
                    return cached.data;
                }
            }
            const result = yield calculation();
            yield this.cacheData(key, result);
            return result;
        });
    }
    // 大数据处理优化
    processBatchData(items, processor) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const batches = this.chunkArray(items, this.config.batchSize);
            for (const batch of batches) {
                const batchResults = yield Promise.all(batch.map(item => processor(item)));
                results.push(...batchResults);
            }
            return results;
        });
    }
    // 内存使用优化
    cacheData(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const serialized = JSON.stringify(data);
            const size = new Blob([serialized]).size / (1024 * 1024); // MB
            // 如果新数据太大，清理一些旧缓存
            while (this.currentCacheSize + size > this.config.maxCacheSize) {
                const oldestKey = this.findOldestCacheKey();
                if (!oldestKey)
                    break;
                const oldItem = this.cache.get(oldestKey);
                this.currentCacheSize -= oldItem.size;
                this.cache.delete(oldestKey);
            }
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                size,
            });
            this.currentCacheSize += size;
            yield this.saveCache();
        });
    }
    // 网络请求优化
    fetchWithRetry(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const retries = (_a = options === null || options === void 0 ? void 0 : options.retries) !== null && _a !== void 0 ? _a : 3;
            let lastError = null;
            for (let i = 0; i < retries; i++) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), this.config.networkTimeout);
                    const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
                    clearTimeout(timeout);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return yield response.json();
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    yield new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                }
            }
            throw lastError;
        });
    }
    // 辅助方法
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    findOldestCacheKey() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    // 配置方法
    updateConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
    }
    clearCache() {
        this.cache.clear();
        this.currentCacheSize = 0;
        this.saveCache();
    }
}
exports.performanceManager = PerformanceManager.getInstance();
