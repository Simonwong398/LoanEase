export interface ValidationRule<T> {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<T>[];
}

export class ValidationService {
  // 贷款金额验证规则
  static loanAmountRules: ValidationRule<number>[] = [
    {
      validate: (amount) => amount > 0,
      message: 'Loan amount must be greater than 0'
    },
    {
      validate: (amount) => amount <= 1000000,
      message: 'Loan amount cannot exceed 1,000,000'
    }
  ];

  // 贷款期限验证规则
  static loanTermRules: ValidationRule<number>[] = [
    {
      validate: (term) => term >= 3,
      message: 'Loan term must be at least 3 months'
    },
    {
      validate: (term) => term <= 360,
      message: 'Loan term cannot exceed 360 months'
    }
  ];

  // 文档验证规则
  static documentRules: ValidationRule<Buffer>[] = [
    {
      validate: (file) => file.length > 0,
      message: 'File cannot be empty'
    },
    {
      validate: (file) => file.length <= 10 * 1024 * 1024, // 10MB
      message: 'File size cannot exceed 10MB'
    }
  ];

  static async validate<T>(value: T, rules: ValidationRule<T>[]): Promise<string[]> {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const isValid = await rule.validate(value);
      if (!isValid) {
        errors.push(rule.message);
      }
    }
    
    return errors;
  }
} 