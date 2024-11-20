import { logger } from '../logger';
import { BaseMonitor } from './baseMonitor';
import { MonitorStats } from './types';
import { performance } from 'perf_hooks';
import * as os from 'os';

interface ResourceMetrics {
  timestamp: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
    rss: number;
  };
  cpu: {
    usage: number;
    userTime: number;
    systemTime: number;
  };
  eventLoop: {
    latency: number;
    lag: number;
  };
  gc: {
    collections: number;
    duration: number;
    type: string;
  };
}

interface ResourceThresholds {
  memory: {
    heapUsedPercent: number;
    rssPercent: number;
  };
  cpu: {
    usagePercent: number;
  };
  eventLoop: {
    maxLatency: number;
  };
}

class ResourceMonitor extends BaseMonitor<ResourceMetrics> {
  private static instance: ResourceMonitor | null = null;
  private readonly thresholds: ResourceThresholds = {
    memory: {
      heapUsedPercent: 85,
      rssPercent: 90,
    },
    cpu: {
      usagePercent: 80,
    },
    eventLoop: {
      maxLatency: 100,
    },
  };

  private lastCPUUsage: NodeJS.CpuUsage | null = null;
  private lastGCStats: { collections: number; duration: number } = {
    collections: 0,
    duration: 0,
  };
  private monitorInterval: NodeJS.Timeout | null = null;
  private readonly MONITOR_INTERVAL = 5000;

  private constructor() {
    super();
    this.startMonitoring();
  }

  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  private startMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    this.monitorInterval = setInterval(() => {
      this.collectMetrics().catch(error => {
        logger.error('ResourceMonitor', 'Failed to collect metrics', error);
      });
    }, this.MONITOR_INTERVAL);

    if (global.gc) {
      (global as any).gc.on('stats', (stats: any) => {
        this.lastGCStats = {
          collections: stats.collections,
          duration: stats.duration,
        };
      });
    }
  }

  private async collectMetrics(): Promise<void> {
    const metrics = await this.gatherResourceMetrics();
    this.record(metrics);
    this.checkThresholds(metrics);
  }

  private async gatherResourceMetrics(): Promise<ResourceMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCPUUsage || undefined);
    this.lastCPUUsage = cpuUsage;

    const eventLoopLag = await this.measureEventLoopLag();

    return {
      timestamp: Date.now(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers || 0,
        rss: memoryUsage.rss,
      },
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000,
        userTime: cpuUsage.user / 1000000,
        systemTime: cpuUsage.system / 1000000,
      },
      eventLoop: {
        latency: eventLoopLag,
        lag: eventLoopLag - this.MONITOR_INTERVAL,
      },
      gc: { ...this.lastGCStats, type: 'unknown' },
    };
  }

  private async measureEventLoopLag(): Promise<number> {
    const start = performance.now();
    return new Promise<number>(resolve => {
      setImmediate(() => {
        resolve(performance.now() - start);
      });
    });
  }

  private checkThresholds(metrics: ResourceMetrics): void {
    const heapUsedPercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    const rssPercent = (metrics.memory.rss / (os.totalmem() * 0.8)) * 100;

    if (heapUsedPercent > this.thresholds.memory.heapUsedPercent) {
      logger.warn('ResourceMonitor', 'High heap memory usage', {
        used: heapUsedPercent.toFixed(2) + '%',
        threshold: this.thresholds.memory.heapUsedPercent + '%',
      });
    }

    if (rssPercent > this.thresholds.memory.rssPercent) {
      logger.warn('ResourceMonitor', 'High RSS memory usage', {
        used: rssPercent.toFixed(2) + '%',
        threshold: this.thresholds.memory.rssPercent + '%',
      });
    }

    const cpuPercent = (metrics.cpu.usage / (this.MONITOR_INTERVAL / 1000)) * 100;
    if (cpuPercent > this.thresholds.cpu.usagePercent) {
      logger.warn('ResourceMonitor', 'High CPU usage', {
        used: cpuPercent.toFixed(2) + '%',
        threshold: this.thresholds.cpu.usagePercent + '%',
      });
    }

    if (metrics.eventLoop.latency > this.thresholds.eventLoop.maxLatency) {
      logger.warn('ResourceMonitor', 'High event loop latency', {
        latency: metrics.eventLoop.latency.toFixed(2) + 'ms',
        threshold: this.thresholds.eventLoop.maxLatency + 'ms',
      });
    }
  }

  async getResourceTrends(timeWindow: number = 3600000): Promise<{
    memory: { timestamp: number; used: number }[];
    cpu: { timestamp: number; usage: number }[];
    eventLoop: { timestamp: number; latency: number }[];
  }> {
    const endTime = Date.now();
    const startTime = endTime - timeWindow;

    const metrics = this.getEntries({
      startTime,
      endTime,
    });

    return {
      memory: metrics.map(m => ({
        timestamp: m.timestamp,
        used: m.memory.heapUsed,
      })),
      cpu: metrics.map(m => ({
        timestamp: m.timestamp,
        usage: m.cpu.usage,
      })),
      eventLoop: metrics.map(m => ({
        timestamp: m.timestamp,
        latency: m.eventLoop.latency,
      })),
    };
  }

  dispose(): void {
    this.onDispose();
    super.dispose();
  }

  protected getMonitorName(): string {
    return 'ResourceMonitor';
  }

  protected performCustomCleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    this.entries = this.entries.filter(entry => now - entry.timestamp < maxAge);
  }

  protected onRecordComplete(metrics: ResourceMetrics): void {
    this.checkThresholds(metrics);
  }

  protected filterByTimeRange(
    entries: ResourceMetrics[],
    startTime?: number,
    endTime?: number
  ): ResourceMetrics[] {
    return entries.filter(entry => {
      if (startTime && entry.timestamp < startTime) return false;
      if (endTime && entry.timestamp > endTime) return false;
      return true;
    });
  }

  protected filterByCategories(
    entries: ResourceMetrics[],
    categories: ReadonlyArray<string>
  ): ResourceMetrics[] {
    return entries;
  }

  protected filterByStatuses(
    entries: ResourceMetrics[],
    statuses: ReadonlyArray<string>
  ): ResourceMetrics[] {
    return entries;
  }

  protected calculateStats(timeWindow?: number): MonitorStats {
    const relevantEntries = timeWindow
      ? this.filterByTimeRange(this.entries, Date.now() - timeWindow)
      : this.entries;

    const total = relevantEntries.length;
    const warningThreshold = this.thresholds.memory.heapUsedPercent;

    const warnings = relevantEntries.filter(entry => 
      (entry.memory.heapUsed / entry.memory.heapTotal) * 100 > warningThreshold
    ).length;

    return {
      total,
      success: total - warnings,
      error: 0,
      warning: warnings,
      avgDuration: undefined
    };
  }

  protected onDispose(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.lastCPUUsage = null;
    this.lastGCStats = { collections: 0, duration: 0 };
  }

  protected onClear(): void {
    this.lastCPUUsage = null;
    this.lastGCStats = { collections: 0, duration: 0 };
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.startMonitoring();
    
    logger.info('ResourceMonitor', 'Monitor state cleared and restarted');
  }
}

export const resourceMonitor = ResourceMonitor.getInstance();
export type { ResourceMetrics, ResourceThresholds }; 