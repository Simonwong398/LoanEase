interface ErrorContext {
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  action?: string;
  data?: any;
}

class ErrorManager {
  private static instance: ErrorManager;
  private errors: Error[] = [];

  private constructor() {}

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  handleError(error: Error, context?: Partial<ErrorContext>): void {
    console.error('Error occurred:', error, context);
    this.errors.push(error);
    // 可以添加更多错误处理逻辑
  }

  getErrors(): Error[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorManager = ErrorManager.getInstance(); 