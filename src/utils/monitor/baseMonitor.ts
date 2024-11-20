import { logger } from '../logger';
import { 
  MonitorFilter,
  MonitorStats,
  IMonitor,
  MonitorResult,
  MonitorConfig,
  ErrorDetails,
  JsonValue
} from './types';
import { MonitorError } from './errors';

abstract class BaseMonitor<T> implements IMonitor<T> {
  protected entries: T[] = [];
  protected config: MonitorConfig;
  protected cleanupInterval: NodeJS.Timeout | null = null;
  protected isInitialized = false;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxEntries: 1000,
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      ...config
    };
    this.initialize();
  }

  protected initialize(): void {
    if (this.isInitialized) return;

    try {
      this.startCleanup();
      this.isInitialized = true;
      logger.info(this.getMonitorName(), 'Initialized successfully');
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Initialization failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  protected abstract getMonitorName(): string;

  protected startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  protected cleanup(): void {
    try {
      if (this.entries.length > this.config.maxEntries) {
        this.entries = this.entries.slice(-this.config.maxEntries);
      }
      this.performCustomCleanup();
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Cleanup failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  protected abstract performCustomCleanup(): void;

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  enable(): void {
    this.config.enabled = true;
    logger.info(this.getMonitorName(), 'Enabled');
  }

  disable(): void {
    this.config.enabled = false;
    logger.info(this.getMonitorName(), 'Disabled');
  }

  record(data: T): void {
    if (!this.isEnabled) return;

    try {
      if (Math.random() <= this.config.sampleRate) {
        this.entries.push(data);
        this.onRecordComplete(data);
      }
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Record failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  protected abstract onRecordComplete(data: T): void;

  getEntries(filter?: MonitorFilter<T>): ReadonlyArray<T> {
    try {
      let filtered = this.entries;

      if (filter) {
        const { startTime, endTime, categories, statuses, predicate } = filter;

        if (startTime !== undefined || endTime !== undefined) {
          filtered = this.filterByTimeRange(filtered, startTime, endTime);
        }

        if (categories?.length) {
          filtered = this.filterByCategories(filtered, categories);
        }

        if (statuses?.length) {
          filtered = this.filterByStatuses(filtered, statuses);
        }

        if (predicate) {
          filtered = filtered.filter(predicate);
        }
      }

      return Object.freeze([...filtered]);
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Get entries failed',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  protected abstract filterByTimeRange(
    entries: T[],
    startTime?: number,
    endTime?: number
  ): T[];

  protected abstract filterByCategories(
    entries: T[],
    categories: ReadonlyArray<string>
  ): T[];

  protected abstract filterByStatuses(
    entries: T[],
    statuses: ReadonlyArray<string>
  ): T[];

  getStats(timeWindow?: number): Readonly<MonitorStats> {
    try {
      const stats = this.calculateStats(timeWindow);
      return Object.freeze(stats);
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Get stats failed',
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        total: 0,
        success: 0,
        error: 0,
        warning: 0
      };
    }
  }

  protected abstract calculateStats(timeWindow?: number): MonitorStats;

  clear(): void {
    try {
      this.entries = [];
      this.onClear();
      logger.info(this.getMonitorName(), 'Cleared');
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Clear failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  protected abstract onClear(): void;

  dispose(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.entries = [];
      this.onDispose();
      logger.info(this.getMonitorName(), 'Disposed');
    } catch (error) {
      logger.error(
        this.getMonitorName(),
        'Dispose failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  protected abstract onDispose(): void;

  protected wrapOperation<R>(
    operation: () => Promise<R> | R,
    name: string
  ): Promise<MonitorResult<R>> {
    const startTime = Date.now();

    return Promise.resolve()
      .then(() => operation())
      .then(
        (data): MonitorResult<R> => ({
          success: true,
          timestamp: startTime,
          duration: Date.now() - startTime,
          data
        })
      )
      .catch(
        (error): MonitorResult<R> => {
          if (error instanceof MonitorError) {
            const safeContext: Record<string, JsonValue> = {};
            if (error.details.context) {
              Object.entries(error.details.context).forEach(([key, value]) => {
                if (this.isJsonValue(value)) {
                  safeContext[key] = value;
                } else {
                  safeContext[key] = String(value);
                }
              });
            }

            return {
              success: false,
              timestamp: startTime,
              duration: Date.now() - startTime,
              error: {
                ...error.details,
                context: safeContext
              }
            };
          }

          const context: Record<string, JsonValue> = {
            name,
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error)
          };

          return {
            success: false,
            timestamp: startTime,
            duration: Date.now() - startTime,
            error: {
              code: 'SYSTEM_ERROR' as const,
              message: error instanceof Error ? error.message : String(error),
              timestamp: startTime,
              errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              severity: 'high' as const,
              recoverable: false,
              stack: error instanceof Error ? error.stack : undefined,
              context
            }
          };
        }
      );
  }

  private isJsonValue(value: unknown): value is JsonValue {
    if (value === null) return true;
    if (['string', 'number', 'boolean'].includes(typeof value)) return true;
    if (Array.isArray(value)) return value.every(item => this.isJsonValue(item));
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).every(v => this.isJsonValue(v));
    }
    return false;
  }
}

export { BaseMonitor }; 