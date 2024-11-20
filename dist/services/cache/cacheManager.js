"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
class CacheManager {
    constructor(config = { maxSize: 1000, ttl: 5 * 60 * 1000 }) {
        this.cache = new Map();
        this.config = config;
    }
    set(key, data) {
        // 检查缓存大小
        if (this.cache.size >= this.config.maxSize) {
            this.evictLeastUsed();
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            hits: 0
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // 检查是否过期
        if (Date.now() - entry.timestamp > this.config.ttl) {
            this.cache.delete(key);
            return null;
        }
        entry.hits++;
        return entry.data;
    }
    evictLeastUsed() {
        let leastUsedKey = null;
        let leastHits = Infinity;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.hits < leastHits) {
                leastHits = entry.hits;
                leastUsedKey = key;
            }
        }
        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
        }
    }
}
exports.CacheManager = CacheManager;
