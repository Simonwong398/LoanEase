import { logger } from '../logger';
import { resourceMonitor } from '../monitor/resourceMonitor';

// 任务优先级定义
export enum TaskPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2,
}

// 任务状态定义
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// 任务接口定义
export interface Task<T = any> {
  id: string;
  priority: TaskPriority;
  execute: () => Promise<T>;
  timestamp: number;
  timeout?: number;
  retries?: number;
  status: TaskStatus;
  result?: T;
  error?: Error;
}

// 并发控制配置
interface ConcurrencyConfig {
  initialMaxConcurrent: number;
  minConcurrent: number;
  maxConcurrent: number;
  scaleInterval: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  scaleStep: number;
}

class ConcurrencyManager {
  private static instance: ConcurrencyManager | null = null;
  private taskQueue: Task[] = [];
  private runningTasks = new Map<string, Task>();
  private currentMaxConcurrent: number;
  private readonly config: ConcurrencyConfig = {
    initialMaxConcurrent: 5,
    minConcurrent: 2,
    maxConcurrent: 10,
    scaleInterval: 5000,    // 5秒检查一次
    scaleUpThreshold: 0.8,  // 80% 负载触发扩容
    scaleDownThreshold: 0.3,// 30% 负载触发缩容
    scaleStep: 1,           // 每次调整步长
  };

  private constructor() {
    this.currentMaxConcurrent = this.config.initialMaxConcurrent;
    this.startScaling();
  }

  static getInstance(): ConcurrencyManager {
    if (!ConcurrencyManager.instance) {
      ConcurrencyManager.instance = new ConcurrencyManager();
    }
    return ConcurrencyManager.instance;
  }

  // 添加任务
  async addTask<T>(
    execute: () => Promise<T>,
    options: {
      priority?: TaskPriority;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const task: Task<T> = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      priority: options.priority ?? TaskPriority.NORMAL,
      execute,
      timestamp: Date.now(),
      timeout: options.timeout,
      retries: options.retries,
      status: TaskStatus.PENDING,
    };

    this.taskQueue.push(task);
    this.sortQueue();
    this.processQueue();

    return new Promise<T>((resolve, reject) => {
      const checkTask = setInterval(() => {
        if (task.status === TaskStatus.COMPLETED && task.result !== undefined) {
          clearInterval(checkTask);
          resolve(task.result);
        } else if (task.status === TaskStatus.FAILED && task.error) {
          clearInterval(checkTask);
          reject(task.error);
        }
      }, 100);
    });
  }

  // 取消任务
  cancelTask(taskId: string): void {
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      runningTask.status = TaskStatus.CANCELLED;
      this.runningTasks.delete(taskId);
    }

    const queuedTaskIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (queuedTaskIndex !== -1) {
      this.taskQueue[queuedTaskIndex].status = TaskStatus.CANCELLED;
      this.taskQueue.splice(queuedTaskIndex, 1);
    }
  }

  // 动态调整并发度
  private startScaling(): void {
    setInterval(() => {
      this.adjustConcurrency();
    }, this.config.scaleInterval);
  }

  private async adjustConcurrency(): Promise<void> {
    try {
      // 获取系统资源使用情况
      const metrics = await resourceMonitor.getResourceTrends(this.config.scaleInterval);
      const lastMetric = metrics.cpu[metrics.cpu.length - 1];
      
      if (!lastMetric) return;

      const cpuUsage = lastMetric.usage;
      const currentLoad = this.runningTasks.size / this.currentMaxConcurrent;

      // 根据 CPU 使用率和当前负载调整并发度
      if (cpuUsage > 80 || currentLoad > this.config.scaleUpThreshold) {
        // 需要降低并发度
        this.scaleConcurrency('down');
      } else if (cpuUsage < 50 && currentLoad < this.config.scaleDownThreshold) {
        // 可以提高并发度
        this.scaleConcurrency('up');
      }

      logger.info('ConcurrencyManager', 'Concurrency adjusted', {
        currentMaxConcurrent: this.currentMaxConcurrent,
        cpuUsage,
        currentLoad,
      });
    } catch (error) {
      // 将 unknown 类型的 error 转换为 Error 对象
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('ConcurrencyManager', 'Failed to adjust concurrency', actualError);
    }
  }

  private scaleConcurrency(direction: 'up' | 'down'): void {
    if (direction === 'up') {
      this.currentMaxConcurrent = Math.min(
        this.currentMaxConcurrent + this.config.scaleStep,
        this.config.maxConcurrent
      );
    } else {
      this.currentMaxConcurrent = Math.max(
        this.currentMaxConcurrent - this.config.scaleStep,
        this.config.minConcurrent
      );
    }
  }

  // 处理任务队列
  private async processQueue(): Promise<void> {
    if (this.runningTasks.size >= this.currentMaxConcurrent) {
      return;
    }

    while (
      this.taskQueue.length > 0 &&
      this.runningTasks.size < this.currentMaxConcurrent
    ) {
      const task = this.taskQueue.shift();
      if (!task) break;

      this.runningTasks.set(task.id, task);
      task.status = TaskStatus.RUNNING;

      this.executeTask(task).finally(() => {
        this.runningTasks.delete(task.id);
        this.processQueue();
      });
    }
  }

  // 执行单个任务
  private async executeTask(task: Task): Promise<void> {
    let attempts = 0;
    const maxAttempts = task.retries ? task.retries + 1 : 1;

    while (attempts < maxAttempts) {
      try {
        const timeoutPromise = task.timeout
          ? new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Task timeout')), task.timeout);
            })
          : null;

        const executePromise = task.execute();
        const result = await (timeoutPromise
          ? Promise.race([executePromise, timeoutPromise])
          : executePromise);

        task.status = TaskStatus.COMPLETED;
        task.result = result;
        return;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          task.status = TaskStatus.FAILED;
          task.error = error instanceof Error ? error : new Error(String(error));
        } else {
          // 重试延迟
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          );
        }
      }
    }
  }

  // 对队列进行排序
  private sortQueue(): void {
    this.taskQueue.sort((a, b) => {
      // 首先按优先级排序
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // 然后按时间戳排序
      return a.timestamp - b.timestamp;
    });
  }

  // 获取当前状态
  getStatus(): {
    queueLength: number;
    runningTasks: number;
    maxConcurrent: number;
  } {
    return {
      queueLength: this.taskQueue.length,
      runningTasks: this.runningTasks.size,
      maxConcurrent: this.currentMaxConcurrent,
    };
  }
}

export const concurrencyManager = ConcurrencyManager.getInstance(); 