import { logger } from '../logger';
import { performanceManager } from '../performance';

// 缓存项接口
interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  expiry?: number;
  hits: number;
  lastAccessed: number;
  size: number;
  metadata?: Record<string, unknown>;
}

// 缓存配置接口
interface CacheConfig {
  maxSize: number;          // 最大缓存大小（字节）
  maxEntries: number;       // 最大缓存条目数
  defaultTTL: number;       // 默认过期时间（毫秒）
  cleanupInterval: number;  // 清理间隔（毫秒）
  maxMemoryUsage: number;   // 最大内存使用率
}

// 缓存统计接口
interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  avgAccessTime: number;
  memoryUsage: number;
}

class CacheManager {
  private static instance: CacheManager | null = null;
  private cache: Map<string, CacheItem<any>> = new Map();
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    totalAccessTime: number;
    accessCount: number;
  } = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalAccessTime: 0,
    accessCount: 0,
  };

  private readonly config: CacheConfig = {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxEntries: 10000,
    defaultTTL: 30 * 60 * 1000, // 30分钟
    cleanupInterval: 5 * 60 * 1000, // 5分钟
    maxMemoryUsage: 0.8, // 80%
  };

  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // 设置缓存
  async set<T>(
    key: string,
    value: T,
    options: {
      ttl?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<void> {
    const startTime = performance.now();

    try {
      const size = this.calculateSize(value);
      
      // 检查是否需要清理空间
      if (this.shouldCleanup(size)) {
        await this.cleanup();
      }

      const cacheItem: CacheItem<T> = {
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
      await performanceManager.recordMetric('cache', 'set', duration, {
        key,
        size,
        ttl: options.ttl,
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('CacheManager', 'Failed to set cache', actualError);
      throw actualError;
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | undefined> {
    const startTime = performance.now();

    try {
      const item = this.cache.get(key) as CacheItem<T> | undefined;

      if (!item) {
        this.stats.misses++;
        await performanceManager.recordMetric('cache', 'get.miss', performance.now() - startTime, { key });
        return undefined;
      }

      // 检查是否过期
      if (item.expiry && Date.now() > item.expiry) {
        this.cache.delete(key);
        this.stats.misses++;
        await performanceManager.recordMetric('cache', 'get.expired', performance.now() - startTime, { key });
        return undefined;
      }

      // 更新访问统计
      item.hits++;
      item.lastAccessed = Date.now();
      this.stats.hits++;
      this.stats.totalAccessTime += performance.now() - startTime;
      this.stats.accessCount++;

      await performanceManager.recordMetric('cache', 'get.hit', performance.now() - startTime, {
        key,
        hits: item.hits,
      });

      return item.value;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('CacheManager', 'Failed to get cache', actualError);
      throw actualError;
    }
  }

  // 删除缓存
  async delete(key: string): Promise<boolean> {
    const startTime = performance.now();

    try {
      const result = this.cache.delete(key);
      
      await performanceManager.recordMetric('cache', 'delete', performance.now() - startTime, {
        key,
        success: result,
      });

      return result;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('CacheManager', 'Failed to delete cache', actualError);
      throw actualError;
    }
  }

  // 清理缓存
  async clear(): Promise<void> {
    const startTime = performance.now();

    try {
      this.cache.clear();
      this.resetStats();
      
      await performanceManager.recordMetric('cache', 'clear', performance.now() - startTime);
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('CacheManager', 'Failed to clear cache', actualError);
      throw actualError;
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
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

  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(error => {
        logger.error('CacheManager', 'Cleanup failed', error);
      });
    }, this.config.cleanupInterval);
  }

  private async cleanup(): Promise<void> {
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
          const [key] = entries.shift()!;
          this.cache.delete(key);
          evicted++;
        }
      }

      this.stats.evictions += evicted;

      await performanceManager.recordMetric('cache', 'cleanup', performance.now() - startTime, {
        evicted,
        remaining: this.cache.size,
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('CacheManager', 'Cleanup failed', actualError);
      throw actualError;
    }
  }

  private shouldCleanup(additionalSize: number): boolean {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, item) => sum + item.size, 0) + additionalSize;

    return (
      this.cache.size >= this.config.maxEntries ||
      totalSize >= this.config.maxSize
    );
  }

  private calculateSize(value: unknown): number {
    try {
      const str = JSON.stringify(value);
      return str.length * 2; // 假设每个字符占用 2 字节
    } catch {
      return 1024; // 如果无法序列化，假设大小为 1KB
    }
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalAccessTime: 0,
      accessCount: 0,
    };
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
    this.resetStats();
  }
}

export const cacheManager = CacheManager.getInstance();
export type { CacheConfig, CacheStats, CacheItem }; 