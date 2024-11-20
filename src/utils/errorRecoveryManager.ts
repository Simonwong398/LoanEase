interface ErrorState {
  error: Error;
  context: any;
  timestamp: number;
  retryCount: number;
}

interface RecoveryStrategy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
  shouldRetry: (error: Error) => boolean;
}

class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorStates: Map<string, ErrorState> = new Map();
  private strategies: Map<string, RecoveryStrategy> = new Map();

  private constructor() {
    this.initializeDefaultStrategies();
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  private initializeDefaultStrategies(): void {
    this.strategies.set('default', {
      maxRetries: 3,
      backoffMs: 1000,
      backoffMultiplier: 2,
      shouldRetry: () => true,
    });

    this.strategies.set('network', {
      maxRetries: 5,
      backoffMs: 2000,
      backoffMultiplier: 1.5,
      shouldRetry: (error) => error.name === 'NetworkError',
    });

    this.strategies.set('calculation', {
      maxRetries: 2,
      backoffMs: 500,
      backoffMultiplier: 2,
      shouldRetry: (error) => error.name === 'CalculationError',
    });
  }

  async handleError(
    operationId: string,
    error: Error,
    context: any,
    operation: () => Promise<any>
  ): Promise<any> {
    const errorState = this.getOrCreateErrorState(operationId, error, context);
    const strategy = this.getStrategy(error);

    if (
      errorState.retryCount < strategy.maxRetries &&
      strategy.shouldRetry(error)
    ) {
      const backoffTime =
        strategy.backoffMs * Math.pow(strategy.backoffMultiplier, errorState.retryCount);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      errorState.retryCount++;
      try {
        const result = await operation();
        this.clearError(operationId);
        return result;
      } catch (retryError) {
        return this.handleError(operationId, retryError, context, operation);
      }
    }

    throw error;
  }

  private getOrCreateErrorState(
    operationId: string,
    error: Error,
    context: any
  ): ErrorState {
    let state = this.errorStates.get(operationId);
    if (!state) {
      state = {
        error,
        context,
        timestamp: Date.now(),
        retryCount: 0,
      };
      this.errorStates.set(operationId, state);
    }
    return state;
  }

  private getStrategy(error: Error): RecoveryStrategy {
    for (const [, strategy] of this.strategies) {
      if (strategy.shouldRetry(error)) {
        return strategy;
      }
    }
    return this.strategies.get('default')!;
  }

  clearError(operationId: string): void {
    this.errorStates.delete(operationId);
  }

  addStrategy(
    name: string,
    strategy: RecoveryStrategy
  ): void {
    this.strategies.set(name, strategy);
  }
}

export const errorRecoveryManager = ErrorRecoveryManager.getInstance(); 