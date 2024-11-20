import { performanceMetricsCollector, PerformanceMetrics } from './performanceMetrics';

interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
}

interface PerformanceWarning {
  id: string;
  metric: string;
  level: 'warning' | 'critical';
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

class PerformanceWarningSystem {
  private static instance: PerformanceWarningSystem;
  private warnings: PerformanceWarning[] = [];
  private listeners: Set<(warnings: PerformanceWarning[]) => void> = new Set();
  
  private thresholds: PerformanceThreshold[] = [
    { metric: 'calculationTime', warning: 1000, critical: 3000 },
    { metric: 'memoryUsage', warning: 0.7, critical: 0.9 },
    { metric: 'cacheHitRate', warning: 0.4, critical: 0.2 },
    { metric: 'batchLatency', warning: 200, critical: 500 },
    { metric: 'cpuUsage', warning: 0.7, critical: 0.9 },
  ];

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): PerformanceWarningSystem {
    if (!PerformanceWarningSystem.instance) {
      PerformanceWarningSystem.instance = new PerformanceWarningSystem();
    }
    return PerformanceWarningSystem.instance;
  }

  private startMonitoring() {
    setInterval(() => {
      const metrics = performanceMetricsCollector.getMetrics();
      this.checkThresholds(metrics);
    }, 5000);
  }

  private checkThresholds(metrics: PerformanceMetrics) {
    this.thresholds.forEach(threshold => {
      const value = metrics[threshold.metric as keyof PerformanceMetrics] as number;
      
      if (value >= threshold.critical) {
        this.addWarning({
          id: `${threshold.metric}_${Date.now()}`,
          metric: threshold.metric,
          level: 'critical',
          value,
          threshold: threshold.critical,
          timestamp: Date.now(),
          message: this.generateWarningMessage(threshold.metric, value, 'critical'),
        });
      } else if (value >= threshold.warning) {
        this.addWarning({
          id: `${threshold.metric}_${Date.now()}`,
          metric: threshold.metric,
          level: 'warning',
          value,
          threshold: threshold.warning,
          timestamp: Date.now(),
          message: this.generateWarningMessage(threshold.metric, value, 'warning'),
        });
      }
    });
  }

  private generateWarningMessage(metric: string, value: number, level: 'warning' | 'critical'): string {
    const formattedValue = value.toFixed(2);
    switch (metric) {
      case 'calculationTime':
        return `计算时间${level === 'critical' ? '严重' : ''}过长: ${formattedValue}ms`;
      case 'memoryUsage':
        return `内存使用率${level === 'critical' ? '严重' : ''}过高: ${(value * 100).toFixed(1)}%`;
      case 'cacheHitRate':
        return `缓存命中率${level === 'critical' ? '严重' : ''}过低: ${(value * 100).toFixed(1)}%`;
      case 'batchLatency':
        return `批处理延迟${level === 'critical' ? '严重' : ''}过高: ${formattedValue}ms`;
      case 'cpuUsage':
        return `CPU使用率${level === 'critical' ? '严重' : ''}过高: ${(value * 100).toFixed(1)}%`;
      default:
        return `${metric}性能${level === 'critical' ? '严重' : ''}异常: ${formattedValue}`;
    }
  }

  private addWarning(warning: PerformanceWarning) {
    this.warnings.push(warning);
    // 只保留最近的100条警告
    if (this.warnings.length > 100) {
      this.warnings.shift();
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getWarnings()));
  }

  subscribe(listener: (warnings: PerformanceWarning[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getWarnings(timeWindow: number = 3600000): PerformanceWarning[] {
    const cutoff = Date.now() - timeWindow;
    return this.warnings.filter(w => w.timestamp >= cutoff);
  }

  clearWarnings() {
    this.warnings = [];
    this.notifyListeners();
  }
}

export const performanceWarningSystem = PerformanceWarningSystem.getInstance(); 