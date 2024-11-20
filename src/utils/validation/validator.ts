type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  validate(value: T): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 预定义验证器
export const Validators = {
  string: {
    min: (min: number, message?: string) => ({
      validate: (value: string) => value.length >= min,
      message: message || `Minimum length is ${min}`
    }),
    max: (max: number, message?: string) => ({
      validate: (value: string) => value.length <= max,
      message: message || `Maximum length is ${max}`
    }),
    email: (message?: string) => ({
      validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: message || 'Invalid email format'
    }),
    regex: (pattern: RegExp, message: string) => ({
      validate: (value: string) => pattern.test(value),
      message
    })
  },
  number: {
    min: (min: number, message?: string) => ({
      validate: (value: number) => value >= min,
      message: message || `Minimum value is ${min}`
    }),
    max: (max: number, message?: string) => ({
      validate: (value: number) => value <= max,
      message: message || `Maximum value is ${max}`
    }),
    positive: (message?: string) => ({
      validate: (value: number) => value > 0,
      message: message || 'Value must be positive'
    }),
    integer: (message?: string) => ({
      validate: (value: number) => Number.isInteger(value),
      message: message || 'Value must be an integer'
    })
  }
}; 