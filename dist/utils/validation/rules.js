"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationRules = void 0;
const validator_1 = require("./validator");
// 基础数据验证规则
exports.ValidationRules = {
    // 用户相关验证
    user: {
        email: new validator_1.Validator()
            .addRule(validator_1.Validators.string.email()),
        password: new validator_1.Validator()
            .addRule(validator_1.Validators.string.min(8, 'Password must be at least 8 characters'))
            .addRule(validator_1.Validators.string.regex(/[A-Z]/, 'Password must contain at least one uppercase letter'))
            .addRule(validator_1.Validators.string.regex(/[a-z]/, 'Password must contain at least one lowercase letter'))
            .addRule(validator_1.Validators.string.regex(/[0-9]/, 'Password must contain at least one number')),
        phone: new validator_1.Validator()
            .addRule(validator_1.Validators.string.regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')),
        name: new validator_1.Validator()
            .addRule(validator_1.Validators.string.min(2, 'Name must be at least 2 characters'))
    },
    // 贷款相关验证
    loan: {
        amount: new validator_1.Validator()
            .addRule(validator_1.Validators.number.positive())
            .addRule(validator_1.Validators.number.min(1000, 'Minimum loan amount is 1000'))
            .addRule(validator_1.Validators.number.max(1000000, 'Maximum loan amount is 1000000')),
        term: new validator_1.Validator()
            .addRule(validator_1.Validators.number.integer())
            .addRule(validator_1.Validators.number.min(3, 'Minimum term is 3 months'))
            .addRule(validator_1.Validators.number.max(360, 'Maximum term is 360 months'))
    }
};
