import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auditManager } from './auditManager';

interface PerformanceConfig {
  enableOfflineMode: boolean;
  maxCacheSize: number;  // MB
  cacheDuration: number; // 毫秒
  batchSize: number;     // 批处理大小
  networkTimeout: number;// 毫秒
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  size: number;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private config: PerformanceConfig = {
    enableOfflineMode: true,
    maxCacheSize: 50,    // 50MB
    cacheDuration: 7 * 24 * 60 * 60 * 1000, // 7天
    batchSize: 100,
    networkTimeout: 10000, // 10秒
  };

  private cache: Map<string, CacheItem<any>> = new Map();
  private currentCacheSize: number = 0;
  private workerPool: Worker[] = [];
  private isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 加载缓存的数据
      await this.loadCache();
      
      // 初始化 Web Worker 池
      this.initializeWorkerPool();
      
      this.isInitialized = true;

      await auditManager.logEvent({
        type: 'performance',
        action: 'initialize',
        status: 'success',
        details: { config: this.config },
      });
    } catch (error) {
      console.error('Failed to initialize performance manager:', error);
      await auditManager.logEvent({
        type: 'performance',
        action: 'initialize',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async loadCache(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem('@performance_cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed.cache);
        this.currentCacheSize = parsed.size;
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        size: this.currentCacheSize,
      };
      await AsyncStorage.setItem('@performance_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private initializeWorkerPool(): void {
    const workerCount = Math.max(1, navigator.hardwareConcurrency - 1);
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(new URL('../workers/calculationWorker.ts', import.meta.url));
      this.workerPool.push(worker);
    }
  }

  // 离线计算支持
  async performOfflineCalculation<T>(
    key: string,
    calculation: () => Promise<T>,
    options?: { force?: boolean }
  ): Promise<T> {
    if (!options?.force && this.config.enableOfflineMode) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
        return cached.data;
      }
    }

    const result = await calculation();
    await this.cacheData(key, result);
    return result;
  }

  // 大数据处理优化
  async processBatchData<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    const batches = this.chunkArray(items, this.config.batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
    }

    return results;
  }

  // 内存使用优化
  private async cacheData<T>(key: string, data: T): Promise<void> {
    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size / (1024 * 1024); // MB

    // 如果新数据太大，清理一些旧缓存
    while (this.currentCacheSize + size > this.config.maxCacheSize) {
      const oldestKey = this.findOldestCacheKey();
      if (!oldestKey) break;
      
      const oldItem = this.cache.get(oldestKey)!;
      this.currentCacheSize -= oldItem.size;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    });
    this.currentCacheSize += size;

    await this.saveCache();
  }

  // 网络请求优化
  async fetchWithRetry<T>(
    url: string,
    options?: RequestInit & { retries?: number }
  ): Promise<T> {
    const retries = options?.retries ?? 3;
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.networkTimeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw lastError;
  }

  // 辅助方法
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private findOldestCacheKey(): string | null {
    let oldestKey: string | null = null;
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
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
    this.saveCache();
  }
}

export const performanceManager = PerformanceManager.getInstance(); 