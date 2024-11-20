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
exports.cacheManager = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccessTime: 0,
            accessCount: 0,
        };
        this.config = {
            maxSize: 100 * 1024 * 1024, // 100MB
            maxEntries: 10000,
            defaultTTL: 30 * 60 * 1000, // 30分钟
            cleanupInterval: 5 * 60 * 1000, // 5分钟
            maxMemoryUsage: 0.8, // 80%
        };
        this.cleanupTimer = null;
        this.startCleanup();
    }
    static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }
    // 设置缓存
    set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, options = {}) {
            const startTime = performance.now();
            try {
                const size = this.calculateSize(value);
                // 检查是否需要清理空间
                if (this.shouldCleanup(size)) {
                    yield this.cleanup();
                }
                const cacheItem = {
                    key,
                    value,
                    timestamp: Date.now(),
                    expiry: options.ttl ? Date.now() + options.ttl : undefined,
                    hits: 0,
                    lastAccessed: Date.now(),
                    size,
                    metadata: options.metadata,
                };
                this.cache.set(key, cacheItem);
                const duration = performance.now() - startTime;
                yield performance_1.performanceManager.recordMetric('cache', 'set', duration, {
                    key,
                    size,
                    ttl: options.ttl,
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('CacheManager', 'Failed to set cache', actualError);
                throw actualError;
            }
        });
    }
    // 获取缓存
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const item = this.cache.get(key);
                if (!item) {
                    this.stats.misses++;
                    yield performance_1.performanceManager.recordMetric('cache', 'get.miss', performance.now() - startTime, { key });
                    return undefined;
                }
                // 检查是否过期
                if (item.expiry && Date.now() > item.expiry) {
                    this.cache.delete(key);
                    this.stats.misses++;
                    yield performance_1.performanceManager.recordMetric('cache', 'get.expired', performance.now() - startTime, { key });
                    return undefined;
                }
                // 更新访问统计
                item.hits++;
                item.lastAccessed = Date.now();
                this.stats.hits++;
                this.stats.totalAccessTime += performance.now() - startTime;
                this.stats.accessCount++;
                yield performance_1.performanceManager.recordMetric('cache', 'get.hit', performance.now() - startTime, {
                    key,
                    hits: item.hits,
                });
                return item.value;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('CacheManager', 'Failed to get cache', actualError);
                throw actualError;
            }
        });
    }
    // 删除缓存
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const result = this.cache.delete(key);
                yield performance_1.performanceManager.recordMetric('cache', 'delete', performance.now() - startTime, {
                    key,
                    success: result,
                });
                return result;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('CacheManager', 'Failed to delete cache', actualError);
                throw actualError;
            }
        });
    }
    // 清理缓存
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                this.cache.clear();
                this.resetStats();
                yield performance_1.performanceManager.recordMetric('cache', 'clear', performance.now() - startTime);
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('CacheManager', 'Failed to clear cache', actualError);
                throw actualError;
            }
        });
    }
    // 获取缓存统计
    getStats() {
        const totalSize = Array.from(this.cache.values())
            .reduce((sum, item) => sum + item.size, 0);
        return {
            totalEntries: this.cache.size,
            totalSize,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
            missRate: this.stats.misses / (this.stats.hits + this.stats.misses) || 0,
            evictionCount: this.stats.evictions,
            avgAccessTime: this.stats.totalAccessTime / this.stats.accessCount || 0,
            memoryUsage: totalSize / this.config.maxSize,
        };
    }
    startCleanup() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.cleanupTimer = setInterval(() => {
            this.cleanup().catch(error => {
                logger_1.logger.error('CacheManager', 'Cleanup failed', error);
            });
        }, this.config.cleanupInterval);
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const now = Date.now();
                let evicted = 0;
                // 删除过期项
                for (const [key, item] of this.cache.entries()) {
                    if (item.expiry && now > item.expiry) {
                        this.cache.delete(key);
                        evicted++;
                    }
                }
                // 如果仍然需要清理空间，按 LRU 策略删除
                if (this.shouldCleanup(0)) {
                    const entries = Array.from(this.cache.entries())
                        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
                    while (this.shouldCleanup(0) && entries.length > 0) {
                        const [key] = entries.shift();
                        this.cache.delete(key);
                        evicted++;
                    }
                }
                this.stats.evictions += evicted;
                yield performance_1.performanceManager.recordMetric('cache', 'cleanup', performance.now() - startTime, {
                    evicted,
                    remaining: this.cache.size,
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('CacheManager', 'Cleanup failed', actualError);
                throw actualError;
            }
        });
    }
    shouldCleanup(additionalSize) {
        const totalSize = Array.from(this.cache.values())
            .reduce((sum, item) => sum + item.size, 0) + additionalSize;
        return (this.cache.size >= this.config.maxEntries ||
            totalSize >= this.config.maxSize);
    }
    calculateSize(value) {
        try {
            const str = JSON.stringify(value);
            return str.length * 2; // 假设每个字符占用 2 字节
        }
        catch (_a) {
            return 1024; // 如果无法序列化，假设大小为 1KB
        }
    }
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccessTime: 0,
            accessCount: 0,
        };
    }
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.cache.clear();
        this.resetStats();
    }
}
CacheManager.instance = null;
exports.cacheManager = CacheManager.getInstance();
