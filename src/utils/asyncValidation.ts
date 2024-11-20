import { ValidationRule } from '../components/InputValidation';
import { validationCache } from './validationCache';

interface AsyncValidationRule {
  validate: (value: string, context?: any) => Promise<boolean>;
  message: string;
}

export const asyncValidationRules: Record<string, AsyncValidationRule[]> = {
  amount: [
    {
      validate: async (value, context) => {
        // 检查信用额度
        const creditLimit = await checkCreditLimit(context?.userId);
        return Number(value) <= creditLimit;
      },
      message: 'validation.amount.creditLimit',
    },
    {
      validate: async (value) => {
        // 检查历史交易限额
        const transactionLimit = await checkTransactionLimit();
        return Number(value) <= transactionLimit;
      },
      message: 'validation.amount.transactionLimit',
    },
  ],
  rate: [
    {
      validate: async (value, context) => {
        // 检查利率是否符合当前政策
        const ratePolicy = await checkRatePolicy(context?.loanType);
        return Number(value) <= ratePolicy.maxRate;
      },
      message: 'validation.rate.policyLimit',
    },
  ],
  term: [
    {
      validate: async (value, context) => {
        // 检查年龄限制
        const ageLimit = await checkAgeLimit(context?.birthDate);
        const termInYears = Number(value);
        return termInYears <= ageLimit;
      },
      message: 'validation.term.ageLimit',
    },
  ],
};

// 异步验证执行器
export const executeAsyncValidation = async (
  fieldName: string,
  value: string,
  context?: any
): Promise<string | undefined> => {
  const cacheKey = validationCache.getCacheKey(fieldName, value, context);
  const cachedResult = validationCache.get(cacheKey);
  
  if (cachedResult !== null) {
    return cachedResult;
  }

  const rules = asyncValidationRules[fieldName] || [];
  
  for (const rule of rules) {
    try {
      const isValid = await rule.validate(value, context);
      if (!isValid) {
        validationCache.set(cacheKey, rule.message, { value, context });
        return rule.message;
      }
    } catch (error) {
      console.error(`Validation error for ${fieldName}:`, error);
    }
  }

  validationCache.set(cacheKey, undefined, { value, context });
  return undefined;
};

// 模拟异步API调用
async function checkCreditLimit(userId?: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return 5000000;
}

async function checkTransactionLimit(): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return 10000000;
}

async function checkRatePolicy(loanType?: string): Promise<{ maxRate: number }> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return { maxRate: loanType === 'providentFund' ? 3.1 : 4.65 };
}

async function checkAgeLimit(birthDate?: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 200));
  if (!birthDate) return 30;
  
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  return Math.min(70 - age, 30);
} 