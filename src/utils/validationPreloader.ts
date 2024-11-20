import { validationCache } from './validationCache';
import { asyncValidationRules } from './asyncValidation';
import { FormValidator } from './formValidation';

interface PreloadConfig {
  fieldName: string;
  values: string[];
  context?: any;
}

export class ValidationPreloader {
  private static readonly BATCH_SIZE = 10;
  private static readonly BATCH_DELAY = 100;

  static async preloadCommonValidations(configs: PreloadConfig[]): Promise<void> {
    for (const config of configs) {
      const rules = FormValidator.getFieldRules(config.fieldName, config.context);
      const asyncRules = asyncValidationRules[config.fieldName] || [];

      // 分批处理以避免阻塞
      for (let i = 0; i < config.values.length; i += this.BATCH_SIZE) {
        const batch = config.values.slice(i, i + this.BATCH_SIZE);
        await Promise.all(
          batch.map(async (value) => {
            const cacheKey = validationCache.getCacheKey(
              config.fieldName,
              value,
              config.context
            );

            // 如果缓存中已存在，跳过
            if (validationCache.get(cacheKey) !== null) {
              return;
            }

            // 执行同步验证
            const isValidSync = rules.every(rule => rule.test(value));
            if (!isValidSync) {
              const failedRule = rules.find(rule => !rule.test(value));
              validationCache.set(cacheKey, failedRule?.message, {
                value,
                context: config.context,
              });
              return;
            }

            // 执行异步验证
            for (const rule of asyncRules) {
              try {
                const isValid = await rule.validate(value, config.context);
                if (!isValid) {
                  validationCache.set(cacheKey, rule.message, {
                    value,
                    context: config.context,
                  });
                  return;
                }
              } catch (error) {
                console.error('Async validation error during preload:', error);
              }
            }

            // 所有验证通过
            validationCache.set(cacheKey, undefined, {
              value,
              context: config.context,
            });
          })
        );

        // 添加延迟以避免过度占用资源
        await new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY));
      }
    }
  }

  // 预加载常见值范围
  static preloadCommonRanges(): void {
    const configs: PreloadConfig[] = [
      {
        fieldName: 'amount',
        values: [
          '100000',
          '500000',
          '1000000',
          '2000000',
          '5000000',
        ],
      },
      {
        fieldName: 'rate',
        values: ['3.1', '3.5', '4.1', '4.5', '5.0'],
      },
      {
        fieldName: 'term',
        values: ['10', '15', '20', '25', '30'],
      },
    ];

    this.preloadCommonValidations(configs);
  }
} 