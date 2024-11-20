import AsyncStorage from '@react-native-async-storage/async-storage';

interface ValidationCacheEntry {
  result: string | undefined;
  timestamp: number;
  params: any;
  hitCount: number;
  lastAccess: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  avgHitRate: number;
  avgAccessTime: number;
}

class ValidationCache {
  private static instance: ValidationCache;
  private cache: Map<string, ValidationCacheEntry> = new Map();
  private stats: {
    hits: number;
    misses: number;
    totalAccessTime: number;
    accessCount: number;
    cacheLoadTime: number;
    cacheSaveTime: number;
    persistenceErrors: number;
  } = {
    hits: 0,
    misses: 0,
    totalAccessTime: 0,
    accessCount: 0,
    cacheLoadTime: 0,
    cacheSaveTime: 0,
    persistenceErrors: 0,
  };

  // 缓存配置
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly MIN_HIT_COUNT = 3;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟
  private readonly FREQUENT_ACCESS_TTL = 30 * 60 * 1000; // 30分钟
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1分钟

  private readonly STORAGE_KEY = '@validation_cache';
  private readonly STATS_STORAGE_KEY = '@validation_cache_stats';
  private readonly PERSISTENCE_INTERVAL = 5 * 60 * 1000; // 5分钟保存一次
  private persistenceTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupTimer();
    this.loadCache();
    this.startPersistenceTimer();
  }

  static getInstance(): ValidationCache {
    if (!ValidationCache.instance) {
      ValidationCache.instance = new ValidationCache();
    }
    return ValidationCache.instance;
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  getCacheKey(fieldName: string, value: string, context?: any): string {
    return `${fieldName}:${value}:${JSON.stringify(context || {})}`;
  }

  get(key: string): string | undefined | null {
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

  set(key: string, result: string | undefined, params: any): void {
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

  private getTTL(entry: ValidationCacheEntry): number {
    // 频繁访问的条目获得更长的TTL
    return entry.hitCount >= this.MIN_HIT_COUNT ? 
      this.FREQUENT_ACCESS_TTL : 
      this.CACHE_TTL;
  }

  private evictEntries(): void {
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

  private calculateEntryScore(entry: ValidationCacheEntry, now: number): number {
    const age = now - entry.timestamp;
    const lastAccessAge = now - entry.lastAccess;
    const hitRate = entry.hitCount / (age / 1000); // 每秒命中率
    
    // 使用加权几何平均数计算分数
    const weights = {
      hitRate: 0.4,      // 命中率权重
      recency: 0.3,      // 最近访问权重
      age: 0.2,          // 年龄权重
      complexity: 0.1,   // 复杂度权重
    };

    const metrics = {
      hitRate: Math.min(hitRate * 10, 1),  // 标准化命中率
      recency: Math.exp(-lastAccessAge / (24 * 60 * 60 * 1000)), // 指数衰减
      age: Math.exp(-age / (7 * 24 * 60 * 60 * 1000)), // 一周为基准的年龄衰减
      complexity: this.calculateComplexity(entry.params), // 参数复杂度
    };

    // 计算加权几何平均数
    return Object.entries(weights).reduce((score, [key, weight]) => {
      return score * Math.pow(metrics[key as keyof typeof metrics], weight);
    }, 1);
  }

  private calculateComplexity(params: any): number {
    const complexity = JSON.stringify(params).length / 1000; // 每1000字符为基准
    return Math.min(complexity, 1); // 标准化到0-1范围
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.getTTL(entry)) {
        this.cache.delete(key);
      }
    }
  }

  invalidate(fieldName: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(`${fieldName}:`)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.resetStats();
    try {
      AsyncStorage.removeItem(this.STORAGE_KEY);
      AsyncStorage.removeItem(this.STATS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear persisted cache:', error);
      this.stats.persistenceErrors++;
    }
  }

  private resetStats(): void {
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

  getStats(): CacheStats {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      avgHitRate: this.stats.hits / (this.stats.hits + this.stats.misses),
      avgAccessTime: this.stats.totalAccessTime / this.stats.accessCount,
    };
  }

  // 预热缓存
  preloadValidation(
    fieldName: string,
    value: string,
    result: string | undefined,
    context?: any
  ): void {
    const key = this.getCacheKey(fieldName, value, context);
    if (!this.cache.has(key)) {
      this.set(key, result, { value, context });
    }
  }

  // 批量预热缓存
  preloadBatch(entries: Array<{
    fieldName: string;
    value: string;
    result: string | undefined;
    context?: any;
  }>): void {
    entries.forEach(entry => {
      this.preloadValidation(
        entry.fieldName,
        entry.value,
        entry.result,
        entry.context
      );
    });
  }

  private async loadCache() {
    const startTime = performance.now();
    try {
      const storedCache = await AsyncStorage.getItem(this.STORAGE_KEY);
      const storedStats = await AsyncStorage.getItem(this.STATS_STORAGE_KEY);
      
      if (storedCache) {
        const entries = JSON.parse(storedCache);
        this.cache = new Map(entries);
      }
      
      if (storedStats) {
        this.stats = { ...this.stats, ...JSON.parse(storedStats) };
      }
    } catch (error) {
      console.error('Failed to load validation cache:', error);
      this.stats.persistenceErrors++;
    } finally {
      this.stats.cacheLoadTime = performance.now() - startTime;
    }
  }

  private async persistCache() {
    const startTime = performance.now();
    try {
      const entries = Array.from(this.cache.entries());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
      await AsyncStorage.setItem(this.STATS_STORAGE_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Failed to persist validation cache:', error);
      this.stats.persistenceErrors++;
    } finally {
      this.stats.cacheSaveTime = performance.now() - startTime;
    }
  }

  private startPersistenceTimer() {
    this.persistenceTimer = setInterval(() => {
      this.persistCache();
    }, this.PERSISTENCE_INTERVAL);
  }

  // 添加更多监控指标
  getDetailedStats(): CacheStats & {
    hitRateByType: Record<string, number>;
    avgResponseTime: Record<string, number>;
    cacheEfficiency: number;
    memoryUsage: number;
    persistenceMetrics: {
      loadTime: number;
      saveTime: number;
      errorRate: number;
    };
    ageDistribution: {
      fresh: number;    // < 1小时
      recent: number;   // < 1天
      old: number;      // > 1天
    };
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    const typeStats = new Map<string, { hits: number; totalTime: number; count: number }>();

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
    const ageDistribution = entries.reduce(
      (dist, [, entry]) => {
        const age = now - entry.timestamp;
        if (age < hourInMs) dist.fresh++;
        else if (age < dayInMs) dist.recent++;
        else dist.old++;
        return dist;
      },
      { fresh: 0, recent: 0, old: 0 }
    );

    return {
      ...this.getStats(),
      hitRateByType: Object.fromEntries(
        Array.from(typeStats.entries()).map(([type, stats]) => [
          type,
          stats.hits / stats.count,
        ])
      ),
      avgResponseTime: Object.fromEntries(
        Array.from(typeStats.entries()).map(([type, stats]) => [
          type,
          stats.totalTime / stats.count,
        ])
      ),
      cacheEfficiency: this.stats.hits / (this.stats.hits + this.stats.misses),
      memoryUsage: process.memoryUsage?.().heapUsed || 0,
      persistenceMetrics: {
        loadTime: this.stats.cacheLoadTime,
        saveTime: this.stats.cacheSaveTime,
        errorRate: this.stats.persistenceErrors / this.stats.accessCount,
      },
      ageDistribution,
    };
  }

  // 析构函数
  destroy() {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }
    this.persistCache(); // 最后一次保存
  }

  // 添加获取所有条目的方法
  getEntries(): [string, ValidationCacheEntry][] {
    return Array.from(this.cache.entries());
  }

  // 添加加载条目的方法
  loadEntries(entries: [string, ValidationCacheEntry][]): void {
    this.cache = new Map(entries);
  }
}

export const validationCache = ValidationCache.getInstance(); 