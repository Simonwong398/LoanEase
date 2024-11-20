/**
 * 并发控制管理器
 */
export class ConcurrencyManager {
  private running = 0;
  private queue: Array<() => void> = [];
  private readonly maxConcurrency: number;

  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * 添加任务到队列
   */
  async add<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrency) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.running++;
    try {
      return await task();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }

  /**
   * 批量处理任务
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => this.add(() => processor(item)))
      );
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * 获取当前运行中的任务数
   */
  getRunningCount(): number {
    return this.running;
  }

  /**
   * 获取等待队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

/**
 * 创建默认的并发管理器实例
 */
export const concurrencyManager = new ConcurrencyManager(); 