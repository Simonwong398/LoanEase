import { LoanCalculationError, ErrorCodes } from './errorHandling';
import { loanTypes } from '../config/loanTypes';

export interface ValidationRules {
  amount: {
    min: number;
    max: number;
  };
  rate: {
    min: number;
    max: number;
  };
  term: {
    min: number;
    max: number;
  };
}

export const validateLoanInput = (
  amount: string,
  rate: string,
  term: string,
  loanType: string,
  rules?: ValidationRules
) => {
  const loanConfig = loanTypes[loanType];
  const defaultRules: ValidationRules = {
    amount: {
      min: loanConfig?.minAmount || 1000,
      max: loanConfig?.maxAmount || 10000000,
    },
    rate: {
      min: 0,
      max: 24, // 最高年利率24%
    },
    term: {
      min: 1,
      max: loanConfig?.maxTerm || 30,
    },
  };

  const validationRules = rules || defaultRules;

  // 验证金额
  const amountValue = parseFloat(amount);
  if (!amount || isNaN(amountValue)) {
    throw new LoanCalculationError(
      'Invalid loan amount',
      ErrorCodes.INVALID_AMOUNT,
      'amount'
    );
  }
  if (amountValue < validationRules.amount.min) {
    throw new LoanCalculationError(
      `Loan amount must be at least ${validationRules.amount.min}`,
      ErrorCodes.AMOUNT_TOO_LOW,
      'amount'
    );
  }
  if (amountValue > validationRules.amount.max) {
    throw new LoanCalculationError(
      `Loan amount cannot exceed ${validationRules.amount.max}`,
      ErrorCodes.AMOUNT_TOO_HIGH,
      'amount'
    );
  }

  // 验证利率
  const rateValue = parseFloat(rate);
  if (!rate || isNaN(rateValue)) {
    throw new LoanCalculationError(
      'Invalid interest rate',
      ErrorCodes.INVALID_RATE,
      'rate'
    );
  }
  if (rateValue < validationRules.rate.min || rateValue > validationRules.rate.max) {
    throw new LoanCalculationError(
      `Interest rate must be between ${validationRules.rate.min}% and ${validationRules.rate.max}%`,
      ErrorCodes.RATE_TOO_HIGH,
      'rate'
    );
  }

  // 验证期限
  const termValue = parseFloat(term);
  if (!term || isNaN(termValue)) {
    throw new LoanCalculationError(
      'Invalid loan term',
      ErrorCodes.INVALID_TERM,
      'term'
    );
  }
  if (termValue < validationRules.term.min || termValue > validationRules.term.max) {
    throw new LoanCalculationError(
      `Loan term must be between ${validationRules.term.min} and ${validationRules.term.max} years`,
      ErrorCodes.TERM_TOO_LONG,
      'term'
    );
  }

  return {
    amount: amountValue,
    rate: rateValue,
    term: termValue,
  };
}; 