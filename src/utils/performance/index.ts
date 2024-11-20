import { logger } from '../logger';
import { resourceMonitor } from '../monitor/resourceMonitor';

// 性能指标类型
interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  type: 'network' | 'render' | 'computation' | 'database' | 'cache' | 'storage' | 'store' | 'i18n' | 'theme' | 'router' | 'docs' | 'error' | 'errorHandling' | 'security' | 'documentation' | 'testing';
  name: string;
  success: boolean;
  context?: Record<string, unknown>;
  resourceUsage?: {
    memory: number;
    cpu: number;
  };
}

// 性能阈值配置
interface PerformanceThresholds {
  network: {
    request: number;
    response: number;
    timeout: number;
  };
  render: {
    firstPaint: number;
    firstContentfulPaint: number;
    largeContentfulPaint: number;
  };
  computation: {
    taskDuration: number;
    idleTimeout: number;
  };
  database: {
    queryTime: number;
    connectionTime: number;
  };
  cache: {
    hitRatio: number;
    maxAge: number;
  };
}

class PerformanceManager {
  private static instance: PerformanceManager | null = null;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 10000;
  private readonly cleanupInterval = 24 * 60 * 60 * 1000; // 24小时
  private cleanupTimer: NodeJS.Timeout | null = null;

  private readonly thresholds: PerformanceThresholds = {
    network: {
      request: 500,    // 500ms
      response: 1000,  // 1s
      timeout: 5000    // 5s
    },
    render: {
      firstPaint: 1000,              // 1s
      firstContentfulPaint: 1500,    // 1.5s
      largeContentfulPaint: 2500     // 2.5s
    },
    computation: {
      taskDuration: 100, // 100ms
      idleTimeout: 50    // 50ms
    },
    database: {
      queryTime: 200,      // 200ms
      connectionTime: 100  // 100ms
    },
    cache: {
      hitRatio: 0.8,    // 80%
      maxAge: 3600000   // 1小时
    }
  };

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  // 记录性能指标
  async recordMetric(
    type: PerformanceMetrics['type'],
    name: string,
    duration: number,
    context?: Record<string, unknown>
  ): Promise<void> {
    try {
      const resourceMetrics = await resourceMonitor.getResourceTrends(1000);
      const lastMetric = resourceMetrics.cpu[resourceMetrics.cpu.length - 1];

      const metric: PerformanceMetrics = {
        timestamp: Date.now(),
        type,
        name,
        duration,
        success: this.isWithinThreshold(type, duration),
        context,
        resourceUsage: lastMetric ? {
          memory: resourceMetrics.memory[resourceMetrics.memory.length - 1].used,
          cpu: lastMetric.usage
        } : undefined
      };

      this.metrics.push(metric);
      this.checkMetricsSize();
      this.analyzeMetric(metric);

    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('PerformanceManager', 'Failed to record metric', actualError);
    }
  }

  // 性能测量装饰器
  measure(type: PerformanceMetrics['type'], name?: string) {
    return function(
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ): PropertyDescriptor {
      const originalMethod = descriptor.value;
      const metricName = name || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function(...args: any[]) {
        const start = performance.now();
        try {
          const result = await originalMethod.apply(this, args);
          const duration = performance.now() - start;
          await performanceManager.recordMetric(type, metricName, duration, {
            args: args.map(arg => 
              typeof arg === 'object' ? Object.keys(arg) : typeof arg
            )
          });
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          await performanceManager.recordMetric(type, metricName, duration, {
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      };

      return descriptor;
    };
  }

  // 分析性能指标
  private analyzeMetric(metric: PerformanceMetrics): void {
    if (!metric.success) {
      logger.warn('PerformanceManager', 'Performance threshold exceeded', {
        type: metric.type,
        name: metric.name,
        duration: metric.duration,
        threshold: this.getThreshold(metric.type, metric.name)
      });

      // 检查资源使用情况
      if (metric.resourceUsage) {
        const { memory, cpu } = metric.resourceUsage;
        if (cpu > 80) { // CPU 使用率超过 80%
          logger.warn('PerformanceManager', 'High CPU usage detected', {
            cpu,
            metric: metric.name
          });
        }
        if (memory > 1024 * 1024 * 1024) { // 内存使用超过 1GB
          logger.warn('PerformanceManager', 'High memory usage detected', {
            memory: Math.round(memory / 1024 / 1024) + 'MB',
            metric: metric.name
          });
        }
      }
    }
  }

  // 获取性能分析报告
  async getPerformanceReport(timeWindow?: number): Promise<{
    summary: {
      totalMetrics: number;
      successRate: number;
      avgDuration: number;
      p95Duration: number;
      resourceUsage: {
        avgCpu: number;
        avgMemory: number;
        peakCpu: number;
        peakMemory: number;
      };
    };
    byType: Record<PerformanceMetrics['type'], {
      count: number;
      successRate: number;
      avgDuration: number;
      p95Duration: number;
    }>;
    slowestOperations: Array<{
      name: string;
      type: PerformanceMetrics['type'];
      avgDuration: number;
      count: number;
    }>;
    recommendations: string[];
  }> {
    const relevantMetrics = timeWindow
      ? this.metrics.filter(m => Date.now() - m.timestamp < timeWindow)
      : this.metrics;

    // 计算基本统计信息
    const totalMetrics = relevantMetrics.length;
    const successfulMetrics = relevantMetrics.filter(m => m.success);
    const durations = relevantMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);

    // 计算资源使用情况
    const resourceMetrics = relevantMetrics
      .filter(m => m.resourceUsage)
      .map(m => m.resourceUsage!);

    // 按类型分组
    const metricsByType = this.groupMetricsByType(relevantMetrics);

    // 查找最慢的操作
    const slowestOps = this.findSlowestOperations(relevantMetrics);

    // 生成优化建议
    const recommendations = this.generateRecommendations(
      relevantMetrics,
      metricsByType,
      slowestOps
    );

    return {
      summary: {
        totalMetrics,
        successRate: successfulMetrics.length / totalMetrics,
        avgDuration: durations.reduce((a, b) => a + b, 0) / totalMetrics,
        p95Duration: durations[p95Index],
        resourceUsage: {
          avgCpu: this.average(resourceMetrics.map(r => r.cpu)),
          avgMemory: this.average(resourceMetrics.map(r => r.memory)),
          peakCpu: Math.max(...resourceMetrics.map(r => r.cpu)),
          peakMemory: Math.max(...resourceMetrics.map(r => r.memory))
        }
      },
      byType: metricsByType,
      slowestOperations: slowestOps,
      recommendations
    };
  }

  private isWithinThreshold(type: PerformanceMetrics['type'], duration: number): boolean {
    const threshold = this.getThreshold(type);
    return duration <= threshold;
  }

  private getThreshold(type: PerformanceMetrics['type'], name?: string): number {
    // 可以根据具体的 name 返回更细粒度的阈值
    switch (type) {
      case 'network':
        return this.thresholds.network.response;
      case 'render':
        return this.thresholds.render.firstContentfulPaint;
      case 'computation':
        return this.thresholds.computation.taskDuration;
      case 'database':
        return this.thresholds.database.queryTime;
      case 'cache':
        return 50; // 50ms
      default:
        return 1000; // 默 1s
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    this.metrics = this.metrics.filter(
      metric => now - metric.timestamp < this.cleanupInterval
    );
  }

  private checkMetricsSize(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private groupMetricsByType(metrics: PerformanceMetrics[]): Record<PerformanceMetrics['type'], {
    count: number;
    successRate: number;
    avgDuration: number;
    p95Duration: number;
  }> {
    const result: any = {};
    const types = new Set(metrics.map(m => m.type));

    types.forEach(type => {
      const typeMetrics = metrics.filter(m => m.type === type);
      const durations = typeMetrics.map(m => m.duration).sort((a, b) => a - b);
      const p95Index = Math.floor(durations.length * 0.95);

      result[type] = {
        count: typeMetrics.length,
        successRate: typeMetrics.filter(m => m.success).length / typeMetrics.length,
        avgDuration: this.average(durations),
        p95Duration: durations[p95Index]
      };
    });

    return result;
  }

  private findSlowestOperations(metrics: PerformanceMetrics[]): Array<{
    name: string;
    type: PerformanceMetrics['type'];
    avgDuration: number;
    count: number;
  }> {
    const operationStats = new Map<string, {
      type: PerformanceMetrics['type'];
      durations: number[];
    }>();

    metrics.forEach(metric => {
      const key = `${metric.type}:${metric.name}`;
      const stats = operationStats.get(key) || { type: metric.type, durations: [] };
      stats.durations.push(metric.duration);
      operationStats.set(key, stats);
    });

    return Array.from(operationStats.entries())
      .map(([key, stats]) => ({
        name: key.split(':')[1],
        type: stats.type,
        avgDuration: this.average(stats.durations),
        count: stats.durations.length
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);
  }

  private generateRecommendations(
    metrics: PerformanceMetrics[],
    metricsByType: any,
    slowestOps: any[]
  ): string[] {
    const recommendations: string[] = [];

    // 检查整体性能
    const overallSuccessRate = metrics.filter(m => m.success).length / metrics.length;
    if (overallSuccessRate < 0.95) {
      recommendations.push(
        `Overall success rate (${(overallSuccessRate * 100).toFixed(1)}%) is below target (95%). Consider reviewing error handling and retry mechanisms.`
      );
    }

    // 检查各类型性能
    Object.entries(metricsByType).forEach(([type, stats]: [string, any]) => {
      if (stats.successRate < 0.95) {
        recommendations.push(
          `${type} operations have low success rate (${(stats.successRate * 100).toFixed(1)}%). Review error handling and optimization opportunities.`
        );
      }
    });

    // 检查最慢操作
    slowestOps.forEach(op => {
      const threshold = this.getThreshold(op.type);
      if (op.avgDuration > threshold) {
        recommendations.push(
          `Operation "${op.name}" (${op.type}) is consistently slow (avg: ${op.avgDuration.toFixed(1)}ms, threshold: ${threshold}ms). Consider optimization or caching.`
        );
      }
    });

    return recommendations;
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.metrics = [];
  }
}

export const performanceManager = PerformanceManager.getInstance();
export { type PerformanceMetrics, type PerformanceThresholds }; 