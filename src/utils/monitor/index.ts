import { logger } from '../logger';
import React from 'react';

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration: number;
  type: 'network' | 'render' | 'computation' | 'io';
  metadata?: Record<string, unknown>;
}

class MemoryMonitor {
  private static instance: MemoryMonitor | null = null;
  private snapshots: MemorySnapshot[] = [];
  private readonly maxSnapshots = 100;
  private monitorInterval: NodeJS.Timeout | null = null;
  private readonly thresholds = {
    heapUsed: 100 * 1024 * 1024, // 100MB
    heapGrowthRate: 0.1, // 10%
  };

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  private startMonitoring(): void {
    this.monitorInterval = setInterval(() => {
      this.takeSnapshot();
      this.analyzeMemoryUsage();
    }, 60000); // 每分钟监控一次
  }

  private takeSnapshot(): void {
    const memory = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers,
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  private analyzeMemoryUsage(): void {
    if (this.snapshots.length < 2) return;

    const latest = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];

    // 检查内存使用量
    if (latest.heapUsed > this.thresholds.heapUsed) {
      logger.warn('MemoryMonitor', 'High memory usage detected', {
        current: latest.heapUsed,
        threshold: this.thresholds.heapUsed,
      });
    }

    // 检查内存增长率
    const growthRate = (latest.heapUsed - previous.heapUsed) / previous.heapUsed;
    if (growthRate > this.thresholds.heapGrowthRate) {
      logger.warn('MemoryMonitor', 'Rapid memory growth detected', {
        growthRate,
        threshold: this.thresholds.heapGrowthRate,
      });
    }
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  dispose(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.snapshots = [];
  }
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private activeOperations = new Map<string, number>();
  private thresholds: Record<string, number> = {
    network: 1000,    // 1秒
    render: 16,       // 16ms
    computation: 100, // 100ms
    io: 500,         // 500ms
  };

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startOperation(name: string, type: PerformanceMetric['type']): void {
    this.activeOperations.set(name, performance.now());
  }

  endOperation(name: string, type: PerformanceMetric['type'], metadata?: Record<string, unknown>): void {
    const startTime = this.activeOperations.get(name);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.activeOperations.delete(name);

    const metric: PerformanceMetric = {
      name,
      startTime,
      duration,
      type,
      metadata,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 检查性能问题
    if (duration > this.thresholds[type]) {
      logger.warn('PerformanceMonitor', 'Performance threshold exceeded', {
        operation: name,
        type,
        duration,
        threshold: this.thresholds[type],
      });
    }
  }

  getMetrics(type?: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics
      .filter(metric => !type || metric.type === type)
      .slice();
  }

  setThreshold(type: PerformanceMetric['type'], threshold: number): void {
    this.thresholds[type] = threshold;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary', 'Component error caught', error, {
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const memoryMonitor = MemoryMonitor.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export { ErrorBoundary };
export type { MemorySnapshot, PerformanceMetric }; 