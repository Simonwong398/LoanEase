import { calculateWithRetry } from './retryMechanism';
import { performanceMonitor } from './performanceMonitor';
import { errorManager } from './errorManager';

export const performCalculation = async (
  calculation: () => Promise<any>,
  operationName: string
) => {
  const perfId = performanceMonitor.startOperation(operationName);

  try {
    const result = await calculateWithRetry(
      calculation,
      (attempt, error) => {
        console.warn(
          `Retry attempt ${attempt} for ${operationName}:`,
          error.message
        );
      }
    );

    performanceMonitor.endOperation(perfId, true);
    return result;
  } catch (error) {
    performanceMonitor.endOperation(perfId, false, error.message);
    errorManager.handleError(error);
    throw error;
  }
}; 