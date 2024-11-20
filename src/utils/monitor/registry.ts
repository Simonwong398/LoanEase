import { logger } from '../logger';
import type { IMonitor, MonitorConfig, EventMetric, PerformanceMetric, MemorySnapshot } from './types';
import { EventMonitor } from './eventMonitor';
import { PerformanceMonitor } from './performanceMonitor';
import { MemoryMonitor } from './memoryMonitor';

// 修改 MonitorConstructor 类型定义
interface MonitorConstructor<T> {
  getInstance(): IMonitor<T>;
}

// 添加具体监控器类型
type EventMonitorType = typeof EventMonitor;
type PerformanceMonitorType = typeof PerformanceMonitor;
type MemoryMonitorType = typeof MemoryMonitor;

class MonitorRegistry {
  private static instance: MonitorRegistry | null = null;
  private monitors: Map<string, IMonitor<any>> = new Map();
  private monitorTypes: Map<string, MonitorConstructor<any>> = new Map();
  private isInitialized = false;

  private constructor() {
    this.registerBuiltInMonitors();
  }

  static getInstance(): MonitorRegistry {
    if (!MonitorRegistry.instance) {
      MonitorRegistry.instance = new MonitorRegistry();
    }
    return MonitorRegistry.instance;
  }

  private registerBuiltInMonitors(): void {
    try {
      // 使用类型断言注册内置监控器
      this.monitorTypes.set('event', EventMonitor as MonitorConstructor<EventMetric>);
      this.monitorTypes.set('performance', PerformanceMonitor as MonitorConstructor<PerformanceMetric>);
      this.monitorTypes.set('memory', MemoryMonitor as MonitorConstructor<MemorySnapshot>);

      // 创建默认实例
      this.monitors.set('event', EventMonitor.getInstance());
      this.monitors.set('performance', PerformanceMonitor.getInstance());
      this.monitors.set('memory', MemoryMonitor.getInstance());

      this.isInitialized = true;
      logger.info('MonitorRegistry', 'Built-in monitors registered');
    } catch (error) {
      logger.error(
        'MonitorRegistry',
        'Failed to register built-in monitors',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  registerMonitorType<T>(type: string, MonitorClass: MonitorConstructor<T>): void {
    try {
      if (this.monitorTypes.has(type)) {
        throw new Error(`Monitor type ${type} already registered`);
      }
      this.monitorTypes.set(type, MonitorClass);
      logger.info('MonitorRegistry', `Monitor type ${type} registered`);
    } catch (error) {
      logger.error(
        'MonitorRegistry',
        `Failed to register monitor type ${type}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  getMonitor<T>(name: string): IMonitor<T> | undefined {
    return this.monitors.get(name) as IMonitor<T> | undefined;
  }

  getAllMonitors(): ReadonlyMap<string, IMonitor<any>> {
    return new Map(this.monitors);
  }

  enableMonitor(name: string): void {
    const monitor = this.monitors.get(name);
    if (monitor) {
      monitor.enable();
      logger.info('MonitorRegistry', `Monitor ${name} enabled`);
    }
  }

  disableMonitor(name: string): void {
    const monitor = this.monitors.get(name);
    if (monitor) {
      monitor.disable();
      logger.info('MonitorRegistry', `Monitor ${name} disabled`);
    }
  }

  removeMonitor(name: string): void {
    try {
      const monitor = this.monitors.get(name);
      if (monitor) {
        monitor.dispose();
        this.monitors.delete(name);
        logger.info('MonitorRegistry', `Monitor ${name} removed`);
      }
    } catch (error) {
      logger.error(
        'MonitorRegistry',
        `Failed to remove monitor ${name}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  clearAllMonitors(): void {
    try {
      this.monitors.forEach((monitor, name) => {
        monitor.clear();
      });
      logger.info('MonitorRegistry', 'All monitors cleared');
    } catch (error) {
      logger.error(
        'MonitorRegistry',
        'Failed to clear all monitors',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  dispose(): void {
    try {
      this.monitors.forEach((monitor, name) => {
        monitor.dispose();
      });
      this.monitors.clear();
      this.monitorTypes.clear();
      this.isInitialized = false;
      logger.info('MonitorRegistry', 'Monitor registry disposed');
    } catch (error) {
      logger.error(
        'MonitorRegistry',
        'Failed to dispose monitor registry',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

export const monitorRegistry = MonitorRegistry.getInstance(); 