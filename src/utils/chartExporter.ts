import { Platform, Share, ShareContent } from 'react-native';
import RNFS from 'react-native-fs';
import { ChartData } from '../components/charts/BaseChart';
import { utils } from 'xlsx';
import { platformManager } from './platformManager';
import { localizationManager } from './localizationManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { securityManager } from './securityManager';
import { ValidationError, AppError } from '../types/errors';
import { withErrorHandling } from '../utils/errorHandler';
import { withTimeoutSignal } from '../utils/timeoutHandler';
import { resourceManager } from '../utils/resourceManager';
import { auditManager } from './auditManager';
import { sanitizeData, generateHash } from '../utils/security/index';
import { ValidatedChartData, UnvalidatedChartData } from '../types/chart';
import { ConcurrencyManager } from './concurrency';
import { withTimeout } from './timeout';
import { logger } from './logger';

interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf';
  quality?: number;
  width?: number;
  height?: number;
  scale?: number;
}

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png'
};

interface ExportResult {
  readonly path: string;
  readonly format: ExportOptions['format'];
  readonly size: number;
  readonly timestamp: number;
}

interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly format: ExportOptions['format'];
}

interface ISecurityManager {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
}

class ChartExporter {
  private static readonly EXPORT_TIMEOUT = 15000; // 15 seconds
  private static readonly CACHE_CLEANUP_TIMEOUT = 5000; // 5 seconds
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private static instance: ChartExporter | null = null;
  private readonly concurrencyManager: ConcurrencyManager;
  private cache: Map<string, CacheEntry<unknown>>;
  private cleanupInterval: NodeJS.Timeout | null;
  private isDisposed: boolean;
  private activeExports: Set<Promise<unknown>>;
  private exportQueue: Array<() => Promise<void>>;

  private constructor() {
    this.concurrencyManager = new ConcurrencyManager(2);
    this.cache = new Map();
    this.cleanupInterval = null;
    this.isDisposed = false;
    this.activeExports = new Set();
    this.exportQueue = [];
    this.startCleanupSchedule();
  }

  public static getInstance(): ChartExporter {
    if (!ChartExporter.instance) {
      ChartExporter.instance = new ChartExporter();
    }
    return ChartExporter.instance;
  }

  private startCleanupSchedule(): void {
    // 每小时清理一次缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanCache().catch(error => {
        console.error('Cache cleanup failed:', error);
      });
    }, 60 * 60 * 1000);
  }

  // 只保留一个异步的 cleanCache 实现
  private async cleanCache(): Promise<void> {
    logger.debug('ChartExporter', 'Starting cache cleanup');

    return withTimeoutSignal(async (signal) => {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      
      for (const [key, value] of entries) {
        if (signal.aborted) {
          break;
        }
        if (now - value.timestamp > ChartExporter.CACHE_TTL) {
          this.cache.delete(key);
        }
      }
      
      logger.info('ChartExporter', 'Cache cleanup completed');
    }, ChartExporter.CACHE_CLEANUP_TIMEOUT, 'Cache cleanup');
  }

  public async dispose(): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    try {
      // 清理定时器
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      // 等待所有活动导出完成
      await Promise.all(Array.from(this.activeExports));

      // 清理缓存
      this.cache.clear();
      this.activeExports.clear();

      await auditManager.logEvent({
        type: 'chart',
        action: 'dispose',
        status: 'success',
        details: { timestamp: Date.now() }
      });
    } catch (error) {
      await auditManager.logEvent({
        type: 'chart',
        action: 'dispose',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private async getCachedResult<T>(
    key: string,
    generator: () => Promise<T>,
    format: ExportOptions['format'] = 'png'
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ChartExporter.CACHE_TTL) {
      return cached.data as T;
    }

    const data = await generator();
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(),
      format
    });
    return data;
  }

  public async exportChart(data: unknown, options: Partial<ExportOptions> = {}): Promise<void> {
    logger.info('ChartExporter', 'Starting chart export', { options });

    // 创建完整的选项对象，确保所有必需的属性都有值
    const fullOptions: ExportOptions = {
      format: options.format || 'png', // 提供默认值
      quality: options.quality ?? 1,
      width: options.width ?? 300,
      height: options.height ?? 200,
      scale: options.scale ?? 1,
    };

    return this.concurrencyManager.add(async () => {
      try {
        await withTimeout(
          this._exportChart(data, fullOptions), // 使用完整的选项对象
          ChartExporter.EXPORT_TIMEOUT,
          'Chart export'
        );
        
        logger.info('ChartExporter', 'Chart export completed');
      } catch (error) {
        logger.error('ChartExporter', 'Chart export failed', 
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      }
    });
  }

  private sanitizeOptions(options: Partial<ExportOptions>): ExportOptions {
    const format = options.format || 'png';
    if (!['png', 'jpeg', 'pdf'].includes(format)) {
      throw new ValidationError('Invalid export format');
    }

    return {
      format,
      quality: options.quality ? Math.min(Math.max(Number(options.quality), 0), 1) : 1,
      width: options.width ? Math.max(Number(options.width), 0) : 300,
      height: options.height ? Math.max(Number(options.height), 0) : 200,
      scale: options.scale ? Math.max(Number(options.scale), 1) : 1,
    };
  }

  private sanitizeChartData(data: unknown): ValidatedChartData {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid chart data format');
    }

    const unvalidatedData = data as UnvalidatedChartData;
    
    return {
      labels: unvalidatedData.labels?.map((label: unknown) => sanitizeData(label)) || [],
      datasets: (unvalidatedData.datasets || []).map(dataset => ({
        data: (dataset.data || []).map(value => Number(value)),
        label: sanitizeData(dataset.label),
        color: dataset.color ? sanitizeData(dataset.color) : undefined
      }))
    };
  }

  private async _exportChart(data: unknown, options: ExportOptions): Promise<void> {
    // 原有的 exportChart 实现
  }

  private async processExportQueue(): Promise<void> {
    while (this.exportQueue.length > 0) {
      const batch = this.exportQueue.splice(0, 3); // 每次处理3个任务
      await Promise.all(
        batch.map((task: () => Promise<void>) => this.concurrencyManager.add(task))
      );
    }
  }

  private async warmupCache(): Promise<void> {
    const commonFormats = ['png', 'jpeg', 'pdf'] as const;
    await Promise.all(
      commonFormats.map(format =>
        this.getCachedResult(
          `template_${format}`,
          async () => ({}),
          format
        )
      )
    );
  }
}

export const chartExporter = ChartExporter.getInstance(); 