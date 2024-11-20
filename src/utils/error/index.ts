import { logger } from '../logger';
import { performanceManager } from '../performance';

// 错误类型定义
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  STORAGE = 'storage',
  SECURITY = 'security',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 错误上下文
export interface ErrorContext {
  timestamp: number;
  component: string;
  operation: string;
  input?: unknown;
  state?: unknown;
  stack?: string;
  cause?: Error;
}

// 错误详情
export interface ErrorDetails {
  type: ErrorType;
  code: string;
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  suggestions: string[];
  recoveryAttempts: number;
  lastRecoveryTime?: number;
  recoverySuccess?: boolean;
  recoveryError?: Error;
}

// 错误统计
export interface ErrorStats {
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  frequency: number;
  avgRecoveryTime: number;
  successfulRecoveries: number;
  failedRecoveries: number;
}

// 自定义错误类
export class AppError extends Error {
  readonly details: ErrorDetails;
  readonly timestamp: number;
  private _handled: boolean;

  constructor(details: Omit<ErrorDetails, 'context'> & { context?: Partial<ErrorContext> }) {
    super(details.message);
    this.name = 'AppError';
    this.timestamp = Date.now();
    this._handled = false;

    this.details = {
      ...details,
      recoveryAttempts: 0,
      context: {
        timestamp: Date.now(),
        component: details.context?.component || 'unknown',
        operation: details.context?.operation || 'unknown',
        input: details.context?.input,
        state: details.context?.state,
        stack: this.stack,
        cause: details.context?.cause
      }
    };
  }

  get handled(): boolean {
    return this._handled;
  }

  set handled(value: boolean) {
    this._handled = value;
  }
}

class ErrorManager {
  private static instance: ErrorManager | null = null;
  private readonly errors: Map<string, ErrorDetails> = new Map();
  private readonly stats: Map<string, ErrorStats> = new Map();
  private readonly recoveryStrategies: Map<string, (error: AppError) => Promise<void>> = new Map();
  private readonly errorPatterns: Map<string, RegExp> = new Map();
  private globalErrorHandler: ((error: Error) => void) | null = null;

  private constructor() {
    this.initializeErrorBoundary();
    this.registerDefaultRecoveryStrategies();
  }

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  // 注册错误恢复策略
  registerRecoveryStrategy(
    errorCode: string,
    strategy: (error: AppError) => Promise<void>
  ): void {
    this.recoveryStrategies.set(errorCode, strategy);
  }

  // 注册错误模式
  registerErrorPattern(name: string, pattern: RegExp): void {
    this.errorPatterns.set(name, pattern);
  }

  // 设置全局错误处理器
  setGlobalErrorHandler(handler: (error: Error) => void): void {
    this.globalErrorHandler = handler;
  }

  // 处理错误
  async handleError(error: unknown): Promise<void> {
    const startTime = performance.now();

    try {
      const appError = this.normalizeError(error);
      
      // 记录错误
      this.recordError(appError);

      // 更新统计信息
      this.updateErrorStats(appError);

      // 尝试恢复
      if (appError.details.recoverable) {
        await this.attemptRecovery(appError);
      }

      // 通知全局处理器
      if (this.globalErrorHandler) {
        this.globalErrorHandler(appError);
      }

      // 记录性能指标
      await performanceManager.recordMetric('errorHandling', 'handle', performance.now() - startTime, {
        type: appError.details.type,
        severity: appError.details.severity,
        recovered: appError.handled,
        errorCode: appError.details.code,
        recoveryAttempts: appError.details.recoveryAttempts
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('ErrorManager', 'Error handling failed', actualError);
    }
  }

  // 获取错误分析报告
  async getErrorAnalysis(): Promise<{
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    topErrors: Array<{ code: string; count: number }>;
    recoveryRate: number;
    averageRecoveryTime: number;
    errorPatterns: Array<{ pattern: string; matches: number }>;
  }> {
    const analysis = {
      totalErrors: this.errors.size,
      errorsByType: {} as Record<ErrorType, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      topErrors: [] as Array<{ code: string; count: number }>,
      recoveryRate: 0,
      averageRecoveryTime: 0,
      errorPatterns: [] as Array<{ pattern: string; matches: number }>
    };

    // 统计错误类型和严重程度
    for (const error of this.errors.values()) {
      analysis.errorsByType[error.type] = (analysis.errorsByType[error.type] || 0) + 1;
      analysis.errorsBySeverity[error.severity] = (analysis.errorsBySeverity[error.severity] || 0) + 1;
    }

    // 计算恢复率和平均恢复时间
    let totalRecoveries = 0;
    let totalRecoveryTime = 0;
    for (const stat of this.stats.values()) {
      totalRecoveries += stat.successfulRecoveries;
      totalRecoveryTime += stat.avgRecoveryTime * stat.successfulRecoveries;
    }

    analysis.recoveryRate = totalRecoveries / this.errors.size;
    analysis.averageRecoveryTime = totalRecoveryTime / totalRecoveries;

    // 获取错误模式匹配
    for (const [name, pattern] of this.errorPatterns) {
      let matches = 0;
      for (const error of this.errors.values()) {
        if (pattern.test(error.message)) {
          matches++;
        }
      }
      analysis.errorPatterns.push({ pattern: name, matches });
    }

    return analysis;
  }

  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return new AppError({
      type: ErrorType.SYSTEM,
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      severity: ErrorSeverity.HIGH,
      recoverable: false,
      retryable: false,
      suggestions: ['Contact system administrator'],
      recoveryAttempts: 0,
      context: {
        stack: errorStack,
        cause: error instanceof Error ? error : undefined
      }
    });
  }

  private recordError(error: AppError): void {
    const errorId = `${error.details.type}_${error.details.code}_${error.timestamp}`;
    this.errors.set(errorId, error.details);

    const errorLog = new Error(error.message);
    Object.assign(errorLog, {
      stack: error.stack,
      details: error.details
    });

    logger.error('ErrorManager', error.message, errorLog);
  }

  private updateErrorStats(error: AppError): void {
    const key = `${error.details.type}_${error.details.code}`;
    const existingStats = this.stats.get(key) || {
      count: 0,
      firstOccurrence: error.timestamp,
      lastOccurrence: error.timestamp,
      frequency: 0,
      avgRecoveryTime: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0
    };

    existingStats.count++;
    existingStats.lastOccurrence = error.timestamp;
    existingStats.frequency = existingStats.count / 
      ((error.timestamp - existingStats.firstOccurrence) / (24 * 60 * 60 * 1000));

    this.stats.set(key, existingStats);
  }

  private async attemptRecovery(error: AppError): Promise<void> {
    const strategy = this.recoveryStrategies.get(error.details.code);
    if (!strategy) return;

    const startTime = performance.now();
    const key = `${error.details.type}_${error.details.code}`;
    const stats = this.stats.get(key);

    try {
      await strategy(error);
      error.handled = true;

      if (stats) {
        stats.successfulRecoveries++;
        stats.avgRecoveryTime = (stats.avgRecoveryTime * (stats.successfulRecoveries - 1) +
          (performance.now() - startTime)) / stats.successfulRecoveries;
      }
    } catch (recoveryError) {
      if (stats) {
        stats.failedRecoveries++;
      }
      throw recoveryError;
    }
  }

  private initializeErrorBoundary(): void {
    // 处理未捕获的异步错误
    process.on('unhandledRejection', (reason) => {
      this.handleError(reason).catch(error => {
        logger.error('ErrorManager', 'Failed to handle unhandledRejection', error);
      });
    });

    // 处理未捕获的同步错误
    process.on('uncaughtException', (error) => {
      this.handleError(error).catch(handlingError => {
        logger.error('ErrorManager', 'Failed to handle uncaughtException', handlingError);
      });
    });
  }

  private registerDefaultRecoveryStrategies(): void {
    // 注册默认的恢复策略
    this.registerRecoveryStrategy('NETWORK_ERROR', async (error) => {
      // 实现网络错误恢复策略
    });

    this.registerRecoveryStrategy('STORAGE_ERROR', async (error) => {
      // 实现存储错误恢复策略
    });

    // ... 注册其他默认恢复策略
  }
}

export const errorManager = ErrorManager.getInstance(); 