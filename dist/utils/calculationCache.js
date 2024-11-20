"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculationCache = void 0;
class CalculationCache {
    constructor() {
        this.cache = new Map();
        this.MAX_CACHE_SIZE = 1000;
        this.CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时
        this.hitCount = 0;
        this.missCount = 0;
    }
    static getInstance() {
        if (!CalculationCache.instance) {
            CalculationCache.instance = new CalculationCache();
        }
        return CalculationCache.instance;
    }
    generateKey(key) {
        return `${key.operation}_${key.params}`;
    }
    get(key) {
        const cacheKey = this.generateKey(key);
        const entry = this.cache.get(cacheKey);
        if (!entry)
            return null;
        // 检查是否过期
        if (Date.now() - entry.timestamp > this.CACHE_EXPIRY) {
            this.cache.delete(cacheKey);
            return null;
        }
        return entry.value;
    }
    set(key, value, computeTime) {
        // 缓存大小限制
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            // 删除最旧的条目
            const oldestKey = Array.from(this.cache.keys())[0];
            this.cache.delete(oldestKey);
        }
        this.cache.set(this.generateKey(key), {
            value,
            timestamp: Date.now(),
            computeTime,
        });
    }
    clear() {
        this.cache.clear();
    }
    getStats() {
        const entries = Array.from(this.cache.values());
        const totalComputeTime = entries.reduce((sum, entry) => sum + entry.computeTime, 0);
        return {
            size: this.cache.size,
            avgComputeTime: entries.length > 0 ? totalComputeTime / entries.length : 0,
            hitRate: this.hitCount / Math.max(this.hitCount + this.missCount, 1),
        };
    }
    recordHit() {
        this.hitCount++;
    }
    recordMiss() {
        this.missCount++;
    }
}
exports.calculationCache = CalculationCache.getInstance();
