interface CacheKey {
  operation: string;
  params: string;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  computeTime: number;
}

class CalculationCache {
  private static instance: CalculationCache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

  private constructor() {}

  static getInstance(): CalculationCache {
    if (!CalculationCache.instance) {
      CalculationCache.instance = new CalculationCache();
    }
    return CalculationCache.instance;
  }

  private generateKey(key: CacheKey): string {
    return `${key.operation}_${key.params}`;
  }

  get<T>(key: CacheKey): T | null {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.CACHE_EXPIRY) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: CacheKey, value: T, computeTime: number): void {
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

  clear(): void {
    this.cache.clear();
  }

  getStats(): {
    size: number;
    avgComputeTime: number;
    hitRate: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalComputeTime = entries.reduce((sum, entry) => sum + entry.computeTime, 0);
    
    return {
      size: this.cache.size,
      avgComputeTime: entries.length > 0 ? totalComputeTime / entries.length : 0,
      hitRate: this.hitCount / Math.max(this.hitCount + this.missCount, 1),
    };
  }

  private hitCount = 0;
  private missCount = 0;

  recordHit() {
    this.hitCount++;
  }

  recordMiss() {
    this.missCount++;
  }
}

export const calculationCache = CalculationCache.getInstance(); 