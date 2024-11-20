import { ValidationRule } from '../components/InputValidation';
import { precise } from './mathUtils';

export interface FormField {
  value: string;
  rules: ValidationRule[];
  touched: boolean;
  error?: string;
}

export interface FormState {
  [key: string]: FormField;
}

export class FormValidator {
  static validateField(field: FormField): string | undefined {
    if (!field.touched) return undefined;

    for (const rule of field.rules) {
      if (!rule.test(field.value)) {
        return rule.message;
      }
    }
    return undefined;
  }

  static validateForm(formState: FormState): boolean {
    return Object.values(formState).every(field => {
      const error = this.validateField(field);
      return !error;
    });
  }

  static getFieldRules(fieldName: string, context?: any): ValidationRule[] {
    const baseRules = {
      amount: [
        {
          test: (value) => !!value,
          message: 'validation.amount.required',
        },
        {
          test: (value) => !isNaN(Number(value)) && Number(value) > 0,
          message: 'validation.amount.positive',
        },
        {
          test: (value) => Number(value) <= 10000000,
          message: 'validation.amount.maxLimit',
        },
        {
          test: (value) => Number(value) % 100 === 0,
          message: 'validation.amount.multiple100',
        },
      ],
      rate: [
        {
          test: (value) => !!value,
          message: 'validation.rate.required',
        },
        {
          test: (value) => !isNaN(Number(value)) && Number(value) > 0,
          message: 'validation.rate.positive',
        },
        {
          test: (value) => Number(value) <= 24,
          message: 'validation.rate.maxLimit',
        },
        {
          test: (value) => {
            const decimalPlaces = value.toString().split('.')[1]?.length || 0;
            return decimalPlaces <= 4;
          },
          message: 'validation.rate.precision',
        },
      ],
      term: [
        {
          test: (value) => !!value,
          message: 'validation.term.required',
        },
        {
          test: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
          message: 'validation.term.integer',
        },
        {
          test: (value) => Number(value) <= 30,
          message: 'validation.term.maxLimit',
        },
      ],
      downPayment: [
        {
          test: (value) => !!value,
          message: 'validation.downPayment.required',
        },
        {
          test: (value) => Number(value) >= 20,
          message: 'validation.downPayment.minLimit',
        },
        {
          test: (value) => Number(value) <= 90,
          message: 'validation.downPayment.maxLimit',
        },
      ],
      monthlyIncome: [
        {
          test: (value) => !!value,
          message: 'validation.monthlyIncome.required',
        },
        {
          test: (value) => Number(value) > 0,
          message: 'validation.monthlyIncome.positive',
        },
        {
          test: (value) => {
            if (!context?.monthlyPayment) return true;
            return (context.monthlyPayment / Number(value)) <= 0.5;
          },
          message: 'validation.monthlyIncome.debtRatio',
        },
      ],
    };

    if (context?.loanType === 'providentFund') {
      baseRules.amount.push({
        test: (value) => Number(value) <= 1200000,
        message: 'validation.amount.providentFundLimit',
      });
    }

    return baseRules[fieldName as keyof typeof baseRules] || [];
  }

  static getCombinedRules(fields: Record<string, string>): ValidationRule[] {
    return [
      {
        test: () => {
          const totalAmount = Number(fields.totalAmount || 0);
          const downPayment = Number(fields.downPayment || 0);
          const loanAmount = Number(fields.amount || 0);
          return precise.add(loanAmount, downPayment) === totalAmount;
        },
        message: 'validation.combined.amountMismatch',
      },
      {
        test: () => {
          const monthlyPayment = Number(fields.monthlyPayment || 0);
          const monthlyIncome = Number(fields.monthlyIncome || 0);
          return monthlyPayment / monthlyIncome <= 0.5;
        },
        message: 'validation.combined.paymentTooHigh',
      },
    ];
  }

  static async validateAsync(
    field: FormField,
    context?: any
  ): Promise<string | undefined> {
    switch (field.value) {
      case 'amount':
        try {
          const creditLimit = await checkCreditLimit();
          if (Number(field.value) > creditLimit) {
            return 'validation.amount.creditLimit';
          }
        } catch (error) {
          console.error('Credit check failed:', error);
        }
        break;
    }
    return undefined;
  }
}

async function checkCreditLimit(): Promise<number> {
  return new Promise(resolve => {
    setTimeout(() => resolve(5000000), 1000);
  });
} 