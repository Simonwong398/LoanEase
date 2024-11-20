import { performanceMonitor } from './performanceMonitor';

interface PerformanceMetrics {
  operationTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  renderTime?: number;
}

interface OperationContext {
  component?: string;
  operation: string;
  input?: any;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private thresholds: Map<string, number> = new Map();
  private warnings: Set<string> = new Set();

  private constructor() {
    this.initializeThresholds();
  }

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  private initializeThresholds() {
    this.thresholds.set('calculation', 500); // 500ms
    this.thresholds.set('render', 16); // 16ms (60fps)
    this.thresholds.set('memory', 100 * 1024 * 1024); // 100MB
  }

  async trackOperation<T>(
    context: OperationContext,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await operation();
      
      const metrics: PerformanceMetrics = {
        operationTime: performance.now() - startTime,
        memoryUsage: this.getMemoryUsage() - startMemory,
      };

      this.analyzeMetrics(context, metrics);
      return result;
    } catch (error) {
      this.recordError(context, error as Error);
      throw error;
    }
  }

  private analyzeMetrics(
    context: OperationContext,
    metrics: PerformanceMetrics
  ): void {
    // 检查操作时间
    const timeThreshold = this.thresholds.get(context.operation) || 500;
    if (metrics.operationTime > timeThreshold) {
      this.addWarning(
        `${context.operation} took ${metrics.operationTime}ms (threshold: ${timeThreshold}ms)`
      );
    }

    // 检查内存使用
    const memoryThreshold = this.thresholds.get('memory')!;
    if (metrics.memoryUsage > memoryThreshold) {
      this.addWarning(
        `High memory usage in ${context.operation}: ${metrics.memoryUsage} bytes`
      );
    }

    // 记录指标
    performanceMonitor.recordMetrics(context.operation, metrics);
  }

  private addWarning(message: string): void {
    this.warnings.add(message);
    performanceMonitor.addWarning(message);
  }

  private recordError(context: OperationContext, error: Error): void {
    performanceMonitor.recordError(error, {
      component: context.component,
      operation: context.operation,
    });
  }

  private getMemoryUsage(): number {
    return process.memoryUsage?.().heapUsed || 0;
  }

  getWarnings(): string[] {
    return Array.from(this.warnings);
  }

  clearWarnings(): void {
    this.warnings.clear();
  }

  setThreshold(operation: string, value: number): void {
    this.thresholds.set(operation, value);
  }
}

export const performanceTracker = PerformanceTracker.getInstance(); 