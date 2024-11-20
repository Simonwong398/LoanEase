import { logger } from '../logger';

// 错误码和对应的用户提示
export const ErrorCodes = {
  // 验证错误
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: '输入数据验证失败',
    suggestion: '请检查输入数据是否符合要求',
    docs: 'https://docs.example.com/validation'
  },
  
  // 网络错误
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: '网络连接失败',
    suggestion: '请检查网络连接并重试',
    docs: 'https://docs.example.com/network'
  },
  
  // 权限错误
  PERMISSION_ERROR: {
    code: 'PERMISSION_ERROR',
    message: '权限不足',
    suggestion: '请确认是否有足够的权限',
    docs: 'https://docs.example.com/permissions'
  },
  
  // 资源错误
  RESOURCE_ERROR: {
    code: 'RESOURCE_ERROR',
    message: '资源访问失败',
    suggestion: '请检查系统资源是否充足',
    docs: 'https://docs.example.com/resources'
  },
  
  // 业务错误
  BUSINESS_ERROR: {
    code: 'BUSINESS_ERROR',
    message: '业务处理失败',
    suggestion: '请检查业务参数是否正确',
    docs: 'https://docs.example.com/business'
  },
  
  // 系统错误
  SYSTEM_ERROR: {
    code: 'SYSTEM_ERROR',
    message: '系统内部错误',
    suggestion: '请联系技术支持',
    docs: 'https://docs.example.com/system'
  }
} as const;

type ErrorCode = keyof typeof ErrorCodes;

// 错误详情接口
interface ErrorDetails {
  code: ErrorCode;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  stack?: string;
  suggestion?: string;
  docs?: string;
  errorId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userAction?: string;
  technicalDetails?: string;
}

// 基础监控错误
export class MonitorError extends Error {
  readonly details: ErrorDetails;

  constructor(
    code: ErrorCode,
    context?: Record<string, unknown>,
    message?: string
  ) {
    const errorInfo = ErrorCodes[code];
    super(message || errorInfo.message);

    this.name = 'MonitorError';
    this.details = {
      code,
      message: this.message,
      timestamp: Date.now(),
      context,
      stack: this.stack,
      suggestion: errorInfo.suggestion,
      docs: errorInfo.docs,
      errorId: this.generateErrorId(),
      severity: this.getSeverity(code),
      recoverable: this.isRecoverable(code),
      userAction: this.getUserAction(code),
      technicalDetails: this.getTechnicalDetails(code, context)
    };
  }

  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverity(code: ErrorCode): ErrorDetails['severity'] {
    const severityMap: Record<ErrorCode, ErrorDetails['severity']> = {
      VALIDATION_ERROR: 'low',
      NETWORK_ERROR: 'medium',
      PERMISSION_ERROR: 'medium',
      RESOURCE_ERROR: 'high',
      BUSINESS_ERROR: 'medium',
      SYSTEM_ERROR: 'critical'
    };
    return severityMap[code];
  }

  private isRecoverable(code: ErrorCode): boolean {
    const recoverableErrors: ErrorCode[] = [
      'VALIDATION_ERROR',
      'NETWORK_ERROR',
      'RESOURCE_ERROR'
    ];
    return recoverableErrors.includes(code);
  }

  private getUserAction(code: ErrorCode): string {
    const actionMap: Record<ErrorCode, string> = {
      VALIDATION_ERROR: '请修正输入数据后重试',
      NETWORK_ERROR: '请检查网络连接后重试',
      PERMISSION_ERROR: '请联系管理员获取权限',
      RESOURCE_ERROR: '请稍后重试或联系技术支持',
      BUSINESS_ERROR: '请检查业务参数后重试',
      SYSTEM_ERROR: '请联系技术支持处理'
    };
    return actionMap[code];
  }

  private getTechnicalDetails(
    code: ErrorCode,
    context?: Record<string, unknown>
  ): string {
    return JSON.stringify({
      code,
      context,
      timestamp: this.details.timestamp,
      stack: this.stack
    }, null, 2);
  }

  toJSON(): ErrorDetails {
    return this.details;
  }

  getErrorMessage(): string {
    return `
错误信息：${this.details.message}
错误代码：${this.details.code}
错误ID：${this.details.errorId}
严重程度：${this.details.severity}
发生时间：${new Date(this.details.timestamp).toLocaleString()}
建议操作：${this.details.userAction}
解决方案：${this.details.suggestion}
技术文档：${this.details.docs}
${this.details.recoverable ? '此错误可以恢复' : '此错误需要技术支持处理'}
    `.trim();
  }
}

// ... 其他代码保持不变 