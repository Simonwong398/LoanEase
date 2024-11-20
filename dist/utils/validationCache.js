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
exports.validationCache = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class ValidationCache {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            totalAccessTime: 0,
            accessCount: 0,
            cacheLoadTime: 0,
            cacheSaveTime: 0,
            persistenceErrors: 0,
        };
        // 缓存配置
        this.MAX_CACHE_SIZE = 1000;
        this.MIN_HIT_COUNT = 3;
        this.CACHE_TTL = 5 * 60 * 1000; // 5分钟
        this.FREQUENT_ACCESS_TTL = 30 * 60 * 1000; // 30分钟
        this.CLEANUP_INTERVAL = 60 * 1000; // 1分钟
        this.STORAGE_KEY = '@validation_cache';
        this.STATS_STORAGE_KEY = '@validation_cache_stats';
        this.PERSISTENCE_INTERVAL = 5 * 60 * 1000; // 5分钟保存一次
        this.persistenceTimer = null;
        this.startCleanupTimer();
        this.loadCache();
        this.startPersistenceTimer();
    }
    static getInstance() {
        if (!ValidationCache.instance) {
            ValidationCache.instance = new ValidationCache();
        }
        return ValidationCache.instance;
    }
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, this.CLEANUP_INTERVAL);
    }
    getCacheKey(fieldName, value, context) {
        return `${fieldName}:${value}:${JSON.stringify(context || {})}`;
    }
    get(key) {
        const startTime = performance.now();
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        const now = Date.now();
        const ttl = this.getTTL(entry);
        if (now - entry.timestamp > ttl) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        // 更新访问统计
        entry.hitCount++;
        entry.lastAccess = now;
        this.stats.hits++;
        this.stats.totalAccessTime += performance.now() - startTime;
        this.stats.accessCount++;
        return entry.result;
    }
    set(key, result, params) {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictEntries();
        }
        this.cache.set(key, {
            result,
            timestamp: Date.now(),
            params,
            hitCount: 1,
            lastAccess: Date.now(),
        });
    }
    getTTL(entry) {
        // 频繁访问的条目获得更长的TTL
        return entry.hitCount >= this.MIN_HIT_COUNT ?
            this.FREQUENT_ACCESS_TTL :
            this.CACHE_TTL;
    }
    evictEntries() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());
        // 计算每个条目的分数
        const scoredEntries = entries.map(([key, entry]) => ({
            key,
            score: this.calculateEntryScore(entry, now),
        }));
        // 按分数排序并移除最低分的条目
        scoredEntries
            .sort((a, b) => a.score - b.score)
            .slice(0, Math.ceil(this.MAX_CACHE_SIZE * 0.2)) // 移除20%的条目
            .forEach(({ key }) => this.cache.delete(key));
    }
    calculateEntryScore(entry, now) {
        const age = now - entry.timestamp;
        const lastAccessAge = now - entry.lastAccess;
        const hitRate = entry.hitCount / (age / 1000); // 每秒命中率
        // 使用加权几何平均数计算分数
        const weights = {
            hitRate: 0.4, // 命中率权重
            recency: 0.3, // 最近访问权重
            age: 0.2, // 年龄权重
            complexity: 0.1, // 复杂度权重
        };
        const metrics = {
            hitRate: Math.min(hitRate * 10, 1), // 标准化命中率
            recency: Math.exp(-lastAccessAge / (24 * 60 * 60 * 1000)), // 指数衰减
            age: Math.exp(-age / (7 * 24 * 60 * 60 * 1000)), // 一周为基准的年龄衰减
            complexity: this.calculateComplexity(entry.params), // 参数复杂度
        };
        // 计算加权几何平均数
        return Object.entries(weights).reduce((score, [key, weight]) => {
            return score * Math.pow(metrics[key], weight);
        }, 1);
    }
    calculateComplexity(params) {
        const complexity = JSON.stringify(params).length / 1000; // 每1000字符为基准
        return Math.min(complexity, 1); // 标准化到0-1范围
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.getTTL(entry)) {
                this.cache.delete(key);
            }
        }
    }
    invalidate(fieldName) {
        for (const [key] of this.cache) {
            if (key.startsWith(`${fieldName}:`)) {
                this.cache.delete(key);
            }
        }
    }
    clear() {
        this.cache.clear();
        this.resetStats();
        try {
            async_storage_1.default.removeItem(this.STORAGE_KEY);
            async_storage_1.default.removeItem(this.STATS_STORAGE_KEY);
        }
        catch (error) {
            console.error('Failed to clear persisted cache:', error);
            this.stats.persistenceErrors++;
        }
    }
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            totalAccessTime: 0,
            accessCount: 0,
            cacheLoadTime: 0,
            cacheSaveTime: 0,
            persistenceErrors: 0,
        };
    }
    getStats() {
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: this.cache.size,
            avgHitRate: this.stats.hits / (this.stats.hits + this.stats.misses),
            avgAccessTime: this.stats.totalAccessTime / this.stats.accessCount,
        };
    }
    // 预热缓存
    preloadValidation(fieldName, value, result, context) {
        const key = this.getCacheKey(fieldName, value, context);
        if (!this.cache.has(key)) {
            this.set(key, result, { value, context });
        }
    }
    // 批量预热缓存
    preloadBatch(entries) {
        entries.forEach(entry => {
            this.preloadValidation(entry.fieldName, entry.value, entry.result, entry.context);
        });
    }
    loadCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const storedCache = yield async_storage_1.default.getItem(this.STORAGE_KEY);
                const storedStats = yield async_storage_1.default.getItem(this.STATS_STORAGE_KEY);
                if (storedCache) {
                    const entries = JSON.parse(storedCache);
                    this.cache = new Map(entries);
                }
                if (storedStats) {
                    this.stats = Object.assign(Object.assign({}, this.stats), JSON.parse(storedStats));
                }
            }
            catch (error) {
                console.error('Failed to load validation cache:', error);
                this.stats.persistenceErrors++;
            }
            finally {
                this.stats.cacheLoadTime = performance.now() - startTime;
            }
        });
    }
    persistCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const entries = Array.from(this.cache.entries());
                yield async_storage_1.default.setItem(this.STORAGE_KEY, JSON.stringify(entries));
                yield async_storage_1.default.setItem(this.STATS_STORAGE_KEY, JSON.stringify(this.stats));
            }
            catch (error) {
                console.error('Failed to persist validation cache:', error);
                this.stats.persistenceErrors++;
            }
            finally {
                this.stats.cacheSaveTime = performance.now() - startTime;
            }
        });
    }
    startPersistenceTimer() {
        this.persistenceTimer = setInterval(() => {
            this.persistCache();
        }, this.PERSISTENCE_INTERVAL);
    }
    // 添加更多监控指标
    getDetailedStats() {
        var _a;
        const now = Date.now();
        const entries = Array.from(this.cache.entries());
        const typeStats = new Map();
        // 计算各类型的统计信息
        entries.forEach(([key, entry]) => {
            const type = key.split(':')[0];
            const stats = typeStats.get(type) || { hits: 0, totalTime: 0, count: 0 };
            stats.hits += entry.hitCount;
            stats.totalTime += now - entry.timestamp;
            stats.count++;
            typeStats.set(type, stats);
        });
        // 计算年龄分布
        const hourInMs = 60 * 60 * 1000;
        const dayInMs = 24 * hourInMs;
        const ageDistribution = entries.reduce((dist, [, entry]) => {
            const age = now - entry.timestamp;
            if (age < hourInMs)
                dist.fresh++;
            else if (age < dayInMs)
                dist.recent++;
            else
                dist.old++;
            return dist;
        }, { fresh: 0, recent: 0, old: 0 });
        return Object.assign(Object.assign({}, this.getStats()), { hitRateByType: Object.fromEntries(Array.from(typeStats.entries()).map(([type, stats]) => [
                type,
                stats.hits / stats.count,
            ])), avgResponseTime: Object.fromEntries(Array.from(typeStats.entries()).map(([type, stats]) => [
                type,
                stats.totalTime / stats.count,
            ])), cacheEfficiency: this.stats.hits / (this.stats.hits + this.stats.misses), memoryUsage: ((_a = process.memoryUsage) === null || _a === void 0 ? void 0 : _a.call(process).heapUsed) || 0, persistenceMetrics: {
                loadTime: this.stats.cacheLoadTime,
                saveTime: this.stats.cacheSaveTime,
                errorRate: this.stats.persistenceErrors / this.stats.accessCount,
            }, ageDistribution });
    }
    // 析构函数
    destroy() {
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
        }
        this.persistCache(); // 最后一次保存
    }
    // 添加获取所有条目的方法
    getEntries() {
        return Array.from(this.cache.entries());
    }
    // 添加加载条目的方法
    loadEntries(entries) {
        this.cache = new Map(entries);
    }
}
exports.validationCache = ValidationCache.getInstance();
