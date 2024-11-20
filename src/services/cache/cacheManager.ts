interface CacheConfig {
  maxSize: number;  // 最大缓存条目数
  ttl: number;      // 缓存生存时间(毫秒)
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig = { maxSize: 1000, ttl: 5 * 60 * 1000 }) {
    this.config = config;
  }

  set<T>(key: string, data: T): void {
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

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
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