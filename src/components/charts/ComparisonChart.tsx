import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { resourceManager } from '../../utils/resourceManager';
import { sanitizeData } from '../../utils/security';
import { ValidatedChartData, UnvalidatedChartData } from '../../types/chart';
import { AppError } from '../../types/errors';
import { ConcurrencyManager } from '../../utils/concurrency';
import { withTimeout } from '../../utils/timeout';
import { logger } from '../../utils/logger';
import { i18nManager } from '../../utils/i18n';

// 使用 AppError 创建本地 ValidationError，而不是导入
class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

interface ComparisonChartProps {
  data: ValidatedChartData;
  comparisonData?: ValidatedChartData;
  onError?: (error: Error) => void;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  comparisonData,
  onError,
}) => {
  const [error, setError] = useState<Error | null>(null);
  const concurrencyManager = useMemo(() => new ConcurrencyManager(2), []);
  const VALIDATION_TIMEOUT = 5000; // 5 seconds

  const handleError = useCallback((err: Error) => {
    logger.error('ComparisonChart', 'Error in chart processing', err);
    setError(err);
    onError?.(err);
  }, [onError]);

  // 先定义验证函数
  const validateAndSanitizeData = useCallback((chartData: unknown): ValidatedChartData => {
    if (!chartData || typeof chartData !== 'object') {
      throw new ValidationError('Invalid chart data format');
    }

    const unvalidatedData = chartData as UnvalidatedChartData;
    
    return {
      labels: unvalidatedData.labels?.map(label => sanitizeData(label)) || [],
      datasets: unvalidatedData.datasets?.map(dataset => ({
        data: dataset.data?.map(value => Number(value)) || [],
        label: sanitizeData(dataset.label || ''),
        color: dataset.color ? sanitizeData(dataset.color) : undefined
      })) || []
    };
  }, []);

  // 然后使用验证函数
  const processedData = useMemo(() => {
    try {
      return withTimeout(
        concurrencyManager.add(async () => {
          const validatedData = validateAndSanitizeData(data);
          return validatedData;
        }),
        VALIDATION_TIMEOUT,
        'Data validation'
      );
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [data, validateAndSanitizeData, handleError, concurrencyManager]);

  useEffect(() => {
    logger.info('ComparisonChart', 'Initializing chart', {
      hasComparisonData: !!comparisonData
    });

    const initialize = async () => {
      try {
        if (processedData) {
          await withTimeout(processedData, VALIDATION_TIMEOUT, 'Data processing');
        }
        if (comparisonData) {
          await withTimeout(
            concurrencyManager.add(async () => {
              validateAndSanitizeData(comparisonData);
            }),
            VALIDATION_TIMEOUT,
            'Comparison data validation'
          );
        }
      } catch (err) {
        logger.error('ComparisonChart', 'Initialization failed', 
          err instanceof Error ? err : new Error(String(err))
        );
        handleError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initialize();
  }, [processedData, comparisonData, validateAndSanitizeData, handleError, concurrencyManager]);

  if (error) {
    return (
      <div role="alert" aria-live="polite">
        <h3>{i18nManager.translate('common.error')}</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return <div>{i18nManager.translate('chart.noData')}</div>;
  }

  // ... 渲染逻辑
};

export default React.memo(ComparisonChart); 