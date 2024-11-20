import { performanceMonitor } from './performanceMonitor';

interface BatchConfig {
  batchSize: number;
  maxBatchSize: number;
  minBatchSize: number;
  targetProcessingTime: number;
  adaptiveThreshold: number;
}

interface BatchMetrics {
  processingTime: number;
  batchSize: number;
  itemCount: number;
  memoryUsage: number;
}

export class BatchProcessor {
  private config: BatchConfig;
  private metrics: BatchMetrics[] = [];
  private currentBatchSize: number;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      batchSize: 1000,
      maxBatchSize: 5000,
      minBatchSize: 100,
      targetProcessingTime: 16, // 目标是每批次处理时间不超过16ms
      adaptiveThreshold: 0.2,   // 当处理时间偏差超过20%时调整批次大小
      ...config,
    };
    this.currentBatchSize = this.config.batchSize;
  }

  async processBatch<T, R>(
    items: T[],
    processor: (items: T[]) => Promise<R[]>,
    onProgress?: (progress: number) => void
  ): Promise<R[]> {
    const results: R[] = [];
    const totalItems = items.length;
    let processedItems = 0;

    while (processedItems < totalItems) {
      const batchStart = processedItems;
      const batchEnd = Math.min(batchStart + this.currentBatchSize, totalItems);
      const batch = items.slice(batchStart, batchEnd);

      const startTime = performance.now();
      const startMemory = process.memoryUsage?.().heapUsed || 0;

      try {
        const batchResults = await processor(batch);
        results.push(...batchResults);

        const endTime = performance.now();
        const endMemory = process.memoryUsage?.().heapUsed || 0;

        this.recordMetrics({
          processingTime: endTime - startTime,
          batchSize: batch.length,
          itemCount: batchResults.length,
          memoryUsage: endMemory - startMemory,
        });

        this.adjustBatchSize();

        processedItems += batch.length;
        if (onProgress) {
          onProgress(processedItems / totalItems);
        }
      } catch (error) {
        // 如果处理失败，减小批次大小并重试
        this.currentBatchSize = Math.max(
          Math.floor(this.currentBatchSize * 0.5),
          this.config.minBatchSize
        );
        console.warn(`Batch processing failed, reducing batch size to ${this.currentBatchSize}`);
        continue;
      }
    }

    return results;
  }

  private recordMetrics(metrics: BatchMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift(); // 保持最近100个批次的指标
    }

    performanceMonitor.recordMetrics('batchProcessing', {
      operationTime: metrics.processingTime,
      memoryUsage: metrics.memoryUsage,
    });
  }

  private adjustBatchSize(): void {
    if (this.metrics.length < 5) return; // 需要足够的样本

    const recentMetrics = this.metrics.slice(-5);
    const avgProcessingTime = recentMetrics.reduce(
      (sum, m) => sum + m.processingTime,
      0
    ) / recentMetrics.length;

    const deviation = Math.abs(avgProcessingTime - this.config.targetProcessingTime) 
      / this.config.targetProcessingTime;

    if (deviation > this.config.adaptiveThreshold) {
      if (avgProcessingTime > this.config.targetProcessingTime) {
        // 处理时间过长，减小批次大小
        this.currentBatchSize = Math.max(
          Math.floor(this.currentBatchSize * 0.8),
          this.config.minBatchSize
        );
      } else {
        // 处理时间较短，增加批次大小
        this.currentBatchSize = Math.min(
          Math.floor(this.currentBatchSize * 1.2),
          this.config.maxBatchSize
        );
      }
    }
  }

  getMetrics(): BatchMetrics[] {
    return [...this.metrics];
  }

  getCurrentBatchSize(): number {
    return this.currentBatchSize;
  }

  reset(): void {
    this.currentBatchSize = this.config.batchSize;
    this.metrics = [];
  }
}

export const batchProcessor = new BatchProcessor(); 