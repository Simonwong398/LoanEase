import { AppError } from '../types/errors';
import { auditManager } from './auditManager';

interface ErrorHandlerOptions {
  rethrow?: boolean;
  context?: string;
  operation?: string;
}

export async function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): Promise<void> {
  const { rethrow = true, context = 'unknown', operation = 'unknown' } = options;

  // 标准化错误对象
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  
  // 记录错误
  await auditManager.logEvent({
    type: 'error',
    action: operation,
    status: 'failure',
    details: {
      context,
      errorType: normalizedError.name,
      errorMessage: normalizedError.message,
      errorCode: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
      errorDetails: error instanceof AppError ? error.details : undefined,
      stack: normalizedError.stack,
    },
  });

  // 如果需要，重新抛出错误
  if (rethrow) {
    throw normalizedError;
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    await handleError(error, options);
    throw error; // TypeScript 需要这行，虽然 handleError 已经可能抛出错误
  }
} 