import { LoanCalculationError, ErrorContext, ErrorSeverity } from './errorHandler';

class ErrorManager {
  private static instance: ErrorManager;
  private errors: Map<string, Error[]> = new Map();

  private constructor() {}

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  async handleCriticalError(error: LoanCalculationError): Promise<void> {
    // 处理关键错误
    this.logError('critical', error);
    // 可以添加通知、重试或其他处理逻辑
  }

  async handleRecoverableError(error: LoanCalculationError): Promise<void> {
    // 处理可恢复错误
    this.logError('recoverable', error);
    // 可以添加重试逻辑
  }

  async handleUnrecoverableError(error: LoanCalculationError): Promise<void> {
    // 处理不可恢复错误
    this.logError('unrecoverable', error);
    // 可以添加用户通知或降级逻辑
  }

  async handleUnknownError(error: Error, context: ErrorContext): Promise<void> {
    // 处理未知错误
    this.logError('unknown', error);
    // 可以添加通用错误处理逻辑
  }

  private logError(type: string, error: Error): void {
    if (!this.errors.has(type)) {
      this.errors.set(type, []);
    }
    this.errors.get(type)!.push(error);
  }

  getErrors(type?: string): Error[] {
    if (type) {
      return this.errors.get(type) || [];
    }
    return Array.from(this.errors.values()).flat();
  }

  clearErrors(): void {
    this.errors.clear();
  }

  async handleError(error: Error, context?: Partial<ErrorContext>): Promise<void> {
    if (error instanceof LoanCalculationError) {
      if (error.context.severity === 'critical') {
        await this.handleCriticalError(error);
      } else if (error.recoverable) {
        await this.handleRecoverableError(error);
      } else {
        await this.handleUnrecoverableError(error);
      }
    } else {
      await this.handleUnknownError(error, {
        timestamp: Date.now(),
        severity: ErrorSeverity.MEDIUM,
        ...context,
      });
    }
  }
}

export const errorManager = ErrorManager.getInstance(); 