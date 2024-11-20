import { Validator, Validators } from './validator';

// 基础数据验证规则
export const ValidationRules = {
  // 用户相关验证
  user: {
    email: new Validator<string>()
      .addRule(Validators.string.email()),
    
    password: new Validator<string>()
      .addRule(Validators.string.min(8, 'Password must be at least 8 characters'))
      .addRule(Validators.string.regex(/[A-Z]/, 'Password must contain at least one uppercase letter'))
      .addRule(Validators.string.regex(/[a-z]/, 'Password must contain at least one lowercase letter'))
      .addRule(Validators.string.regex(/[0-9]/, 'Password must contain at least one number')),
    
    phone: new Validator<string>()
      .addRule(Validators.string.regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')),
    
    name: new Validator<string>()
      .addRule(Validators.string.min(2, 'Name must be at least 2 characters'))
  },

  // 贷款相关验证
  loan: {
    amount: new Validator<number>()
      .addRule(Validators.number.positive())
      .addRule(Validators.number.min(1000, 'Minimum loan amount is 1000'))
      .addRule(Validators.number.max(1000000, 'Maximum loan amount is 1000000')),
    
    term: new Validator<number>()
      .addRule(Validators.number.integer())
      .addRule(Validators.number.min(3, 'Minimum term is 3 months'))
      .addRule(Validators.number.max(360, 'Maximum term is 360 months'))
  }
}; 