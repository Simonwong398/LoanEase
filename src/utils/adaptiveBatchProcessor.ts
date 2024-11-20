interface BatchStats {
  batchSize: number;
  processingTime: number;
  memoryUsage: number;
}

class AdaptiveBatchProcessor {
  private static instance: AdaptiveBatchProcessor;
  private stats: BatchStats[] = [];
  private readonly MAX_STATS_SIZE = 10;
  private readonly TARGET_BATCH_TIME = 100; // 目标每批次处理时间（毫秒）
  private readonly MIN_BATCH_SIZE = 5;
  private readonly MAX_BATCH_SIZE = 50;

  private constructor() {}

  static getInstance(): AdaptiveBatchProcessor {
    if (!AdaptiveBatchProcessor.instance) {
      AdaptiveBatchProcessor.instance = new AdaptiveBatchProcessor();
    }
    return AdaptiveBatchProcessor.instance;
  }

  // 根据历史数据调整批处理大小
  getOptimalBatchSize(): number {
    if (this.stats.length === 0) return this.MIN_BATCH_SIZE;

    const recentStats = this.stats.slice(-3);
    const avgTime = recentStats.reduce((sum, stat) => sum + stat.processingTime, 0) / recentStats.length;
    const avgMemory = recentStats.reduce((sum, stat) => sum + stat.memoryUsage, 0) / recentStats.length;

    let optimalSize = recentStats[recentStats.length - 1].batchSize;

    if (avgTime > this.TARGET_BATCH_TIME * 1.2) {
      // 处理时间过长，减小批量
      optimalSize = Math.max(this.MIN_BATCH_SIZE, Math.floor(optimalSize * 0.8));
    } else if (avgTime < this.TARGET_BATCH_TIME * 0.8 && avgMemory < 0.8) {
      // 处理时间短且内存充足，增加批量
      optimalSize = Math.min(this.MAX_BATCH_SIZE, Math.ceil(optimalSize * 1.2));
    }

    return optimalSize;
  }

  // 记录批处理统计信息
  recordStats(stats: BatchStats): void {
    this.stats.push(stats);
    if (this.stats.length > this.MAX_STATS_SIZE) {
      this.stats.shift();
    }
  }

  // 获取性能统计信息
  getPerformanceStats() {
    if (this.stats.length === 0) return null;

    return {
      avgProcessingTime: this.stats.reduce((sum, stat) => sum + stat.processingTime, 0) / this.stats.length,
      avgMemoryUsage: this.stats.reduce((sum, stat) => sum + stat.memoryUsage, 0) / this.stats.length,
      avgBatchSize: this.stats.reduce((sum, stat) => sum + stat.batchSize, 0) / this.stats.length,
    };
  }
}

export const adaptiveBatchProcessor = AdaptiveBatchProcessor.getInstance(); 