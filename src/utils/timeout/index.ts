import { logger } from '../logger';

// 超时配置接口
interface TimeoutConfig {
  timeout: number;
  retries?: number;
  retryDelay?: number;
  onTimeout?: () => void;
  fallback?: () => Promise<any>;
}

// 超时错误类
class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly duration: number,
    public readonly operationId: string
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// 超时状态
interface TimeoutState {
  startTime: number;
  attempts: number;
  lastError?: Error;
}

class TimeoutManager {
  private static instance: TimeoutManager | null = null;
  private timeouts = new Map<string, NodeJS.Timeout>();
  private states = new Map<string, TimeoutState>();

  // 默认超时配置
  private readonly defaultTimeouts = {
    network: 5000,    // 网络请求超时 5s
    database: 3000,   // 数据库操作超时 3s
    cache: 1000,      // 缓存操作超时 1s
    computation: 2000 // 计算操作超时 2s
  };

  private constructor() {}

  static getInstance(): TimeoutManager {
    if (!TimeoutManager.instance) {
      TimeoutManager.instance = new TimeoutManager();
    }
    return TimeoutManager.instance;
  }

  // 包装异步操作添加超时处理
  async withTimeout<T>(
    operation: () => Promise<T>,
    config: TimeoutConfig | number
  ): Promise<T> {
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timeoutConfig = typeof config === 'number' ? { timeout: config } : config;
    
    this.states.set(operationId, {
      startTime: Date.now(),
      attempts: 0
    });

    return this.executeWithRetries(operation, operationId, timeoutConfig);
  }

  // 带重试的执行
  private async executeWithRetries<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: TimeoutConfig
  ): Promise<T> {
    const state = this.states.get(operationId)!;
    const maxAttempts = (config.retries || 0) + 1;

    while (state.attempts < maxAttempts) {
      try {
        return await this.executeWithTimeout(operation, operationId, config);
      } catch (error) {
        state.attempts++;
        state.lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof TimeoutError) {
          // 触发超时回调
          config.onTimeout?.();

          // 如果有 fallback，且是最后一次尝试，则执行 fallback
          if (config.fallback && state.attempts === maxAttempts) {
            return config.fallback();
          }
        }

        // 如果还有重试机会，则等待后重试
        if (state.attempts < maxAttempts) {
          const delay = this.calculateRetryDelay(config.retryDelay, state.attempts);
          await this.delay(delay);
          continue;
        }

        // 清理状态
        this.cleanup(operationId);
        throw state.lastError;
      }
    }

    throw state.lastError;
  }

  // 执行带超时的操作
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: TimeoutConfig
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 设置超时定时器
      const timeout = setTimeout(() => {
        this.timeouts.delete(operationId);
        const duration = Date.now() - this.states.get(operationId)!.startTime;
        reject(new TimeoutError(
          `Operation timed out after ${duration}ms`,
          duration,
          operationId
        ));
      }, config.timeout);

      this.timeouts.set(operationId, timeout);

      // 执行操作
      operation()
        .then(result => {
          this.clearTimeout(operationId);
          resolve(result);
        })
        .catch(error => {
          this.clearTimeout(operationId);
          reject(error);
        });
    });
  }

  // 计算重试延迟
  private calculateRetryDelay(baseDelay: number = 1000, attempt: number): number {
    // 使用指数退避策略
    return Math.min(
      baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
      30000 // 最大延迟30秒
    );
  }

  // 延迟执行
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清理超时定时器
  private clearTimeout(operationId: string): void {
    const timeout = this.timeouts.get(operationId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(operationId);
    }
  }

  // 清理状态
  private cleanup(operationId: string): void {
    this.clearTimeout(operationId);
    this.states.delete(operationId);
  }

  // 获取默认超时时间
  getDefaultTimeout(operationType: keyof typeof this.defaultTimeouts): number {
    return this.defaultTimeouts[operationType];
  }

  // 批量执行带超时的操作
  async withTimeoutBatch<T>(
    operations: Array<() => Promise<T>>,
    config: TimeoutConfig
  ): Promise<T[]> {
    return Promise.all(
      operations.map(op => this.withTimeout(op, config))
    );
  }

  // 清理所有超时和状态
  dispose(): void {
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
    this.states.clear();
  }
}

export const timeoutManager = TimeoutManager.getInstance();
export type { TimeoutConfig };
export { TimeoutError }; 