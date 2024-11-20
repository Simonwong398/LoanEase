interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffFactor: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffFactor: 2,
};

export class RetryError extends Error {
  attempts: number;
  lastError: Error;

  constructor(message: string, attempts: number, lastError: Error) {
    super(message);
    this.name = 'RetryError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error;
  let delay = finalConfig.delayMs;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === finalConfig.maxAttempts) {
        throw new RetryError(
          `Operation failed after ${attempt} attempts`,
          attempt,
          lastError
        );
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= finalConfig.backoffFactor;
    }
  }

  throw new RetryError(
    'Unexpected retry failure',
    finalConfig.maxAttempts,
    lastError!
  );
};

// 使用示例：
export const calculateWithRetry = async (
  calculation: () => Promise<any>,
  onRetry?: (attempt: number, error: Error) => void
) => {
  try {
    return await withRetry(calculation, {
      maxAttempts: 3,
      delayMs: 1000,
      backoffFactor: 2,
    });
  } catch (error) {
    if (error instanceof RetryError) {
      console.error(
        `Calculation failed after ${error.attempts} attempts:`,
        error.lastError
      );
    }
    throw error;
  }
}; 