import { ValidationRule } from '../components/InputValidation';
import { asyncValidationRules, executeAsyncValidation } from './asyncValidation';
import { validationCache } from './validationCache';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  asyncPending?: boolean;
}

export class ValidationOptimizer {
  private static validateValueWithRules(
    value: string,
    rules: ValidationRule[]
  ): boolean {
    // 使用 every 代替 for 循环提高性能
    return rules.every(rule => rule.test(value));
  }

  static async validateField(
    fieldName: string,
    value: string,
    rules: ValidationRule[],
    context?: any
  ): Promise<ValidationResult> {
    // 首先执行同步验证
    const isValidSync = this.validateValueWithRules(value, rules);
    if (!isValidSync) {
      const failedRule = rules.find(rule => !rule.test(value));
      return { isValid: false, error: failedRule?.message };
    }

    // 检查是否需要异步验证
    const asyncRules = asyncValidationRules[fieldName];
    if (!asyncRules?.length) {
      return { isValid: true };
    }

    // 执行异步验证
    try {
      const error = await executeAsyncValidation(fieldName, value, context);
      return {
        isValid: !error,
        error,
        asyncPending: false,
      };
    } catch (error) {
      console.error('Async validation error:', error);
      return {
        isValid: false,
        error: 'validation.error.async',
        asyncPending: false,
      };
    }
  }

  static validateFieldBatch(
    fields: Array<{
      fieldName: string;
      value: string;
      rules: ValidationRule[];
      context?: any;
    }>
  ): Promise<Record<string, ValidationResult>> {
    // 使用 Promise.all 并行执行所有验证
    return Promise.all(
      fields.map(async ({ fieldName, value, rules, context }) => ({
        fieldName,
        result: await this.validateField(fieldName, value, rules, context),
      }))
    ).then(results =>
      results.reduce(
        (acc, { fieldName, result }) => ({
          ...acc,
          [fieldName]: result,
        }),
        {}
      )
    );
  }

  static preloadValidation(
    fieldName: string,
    value: string,
    rules: ValidationRule[],
    context?: any
  ): void {
    // 预加载异步验证结果到缓存
    executeAsyncValidation(fieldName, value, context).catch(() => {
      // 忽略预加载错误
    });
  }

  static clearValidationCache(fieldName?: string): void {
    if (fieldName) {
      validationCache.invalidate(fieldName);
    } else {
      validationCache.clear();
    }
  }
} 