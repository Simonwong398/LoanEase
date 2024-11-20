// 扩展 Performance 接口以包含 memory 属性
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

declare global {
  interface Window {
    performance: ExtendedPerformance;
  }
}

interface MemoryConfig {
  maxHeapSize: number;
  warningThreshold: number;
  criticalThreshold: number;
  cleanupInterval: number;
}

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  usage: number;
  status: 'normal' | 'warning' | 'critical';
}

class MemoryManager {
  private static instance: MemoryManager;
  private config: MemoryConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private callbacks: Set<() => void> = new Set();

  private constructor() {
    this.config = {
      maxHeapSize: 512 * 1024 * 1024, // 512MB
      warningThreshold: 0.7,  // 70%
      criticalThreshold: 0.9, // 90%
      cleanupInterval: 30000, // 30秒
    };
    this.startMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private startMonitoring(): void {
    this.cleanupTimer = setInterval(() => {
      const stats = this.getMemoryStats();
      if (stats.status === 'critical') {
        this.forceCleanup();
      } else if (stats.status === 'warning') {
        this.notifyWarning();
      }
    }, this.config.cleanupInterval);
  }

  getMemoryStats(): MemoryStats {
    const memory = process.memoryUsage?.() || {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
    };

    const usage = memory.heapUsed / this.config.maxHeapSize;
    let status: MemoryStats['status'] = 'normal';

    if (usage >= this.config.criticalThreshold) {
      status = 'critical';
    } else if (usage >= this.config.warningThreshold) {
      status = 'warning';
    }

    return {
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      usage,
      status,
    };
  }

  private async forceCleanup(): Promise<void> {
    // 通知所有注册的回调
    this.callbacks.forEach(callback => callback());

    // 强制垃圾回收
    if (global.gc) {
      global.gc();
    }
  }

  private notifyWarning(): void {
    console.warn('Memory usage is high:', this.getMemoryStats());
  }

  onCleanup(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  shouldDefer(): boolean {
    const stats = this.getMemoryStats();
    return stats.status === 'critical';
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.callbacks.clear();
  }
}

export const memoryManager = MemoryManager.getInstance(); 