import { batchProcessor } from './batchProcessor';
import { memoryManager } from './memoryManager';
import { performanceMonitor } from './performanceMonitor';

interface OptimizationConfig {
  useWorker: boolean;
  cacheResults: boolean;
  batchProcessing: boolean;
  memoryAware: boolean;
}

class CalculationOptimizer {
  private config: OptimizationConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      useWorker: true,
      cacheResults: true,
      batchProcessing: true,
      memoryAware: true,
      ...config,
    };

    // 注册内存清理回调
    if (this.config.memoryAware) {
      memoryManager.onCleanup(() => this.clearCache());
    }
  }

  async process<T, R>(
    items: T[],
    processor: (items: T[]) => Promise<R[]>,
    options: {
      key?: string;
      progress?: (progress: number) => void;
    } = {}
  ): Promise<R[]> {
    const startTime = performance.now();

    try {
      // 检查缓存
      if (this.config.cacheResults && options.key) {
        const cached = this.cache.get(options.key);
        if (cached) {
          return cached;
        }
      }

      // 检查内存状态
      if (this.config.memoryAware && memoryManager.shouldDefer()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      let results: R[];
      
      if (this.config.batchProcessing) {
        // 使用批处理
        results = await batchProcessor.processBatch(
          items,
          processor,
          options.progress
        );
      } else {
        // 直接处理
        results = await processor(items);
      }

      // 缓存结果
      if (this.config.cacheResults && options.key) {
        this.cache.set(options.key, results);
      }

      const endTime = performance.now();
      performanceMonitor.recordMetrics('calculation', {
        operationTime: endTime - startTime,
        memoryUsage: process.memoryUsage?.().heapUsed || 0,
      });

      return results;
    } catch (error) {
      console.error('Calculation failed:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}

export const calculationOptimizer = new CalculationOptimizer(); 