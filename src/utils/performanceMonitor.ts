import { ErrorContext } from './errorHandler';

export interface PerformanceMetrics {
  operationTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  renderTime?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private warnings: Set<string> = new Set();
  private errors: Error[] = [];

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetrics(operation: string, metrics: PerformanceMetrics): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(metrics);
  }

  addWarning(message: string): void {
    this.warnings.add(message);
  }

  recordError(error: Error, context: Partial<ErrorContext>): void {
    this.errors.push(error);
    // 可以添加更多错误处理逻辑
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    return Array.from(this.metrics.values()).flat();
  }

  getWarnings(): string[] {
    return Array.from(this.warnings);
  }

  getErrors(): Error[] {
    return [...this.errors];
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  clearWarnings(): void {
    this.warnings.clear();
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 