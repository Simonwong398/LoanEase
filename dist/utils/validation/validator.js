"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = exports.Validator = void 0;
class Validator {
    constructor() {
        this.rules = [];
    }
    addRule(rule) {
        this.rules.push(rule);
        return this;
    }
    validate(value) {
        const errors = [];
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
exports.Validator = Validator;
// 预定义验证器
exports.Validators = {
    string: {
        min: (min, message) => ({
            validate: (value) => value.length >= min,
            message: message || `Minimum length is ${min}`
        }),
        max: (max, message) => ({
            validate: (value) => value.length <= max,
            message: message || `Maximum length is ${max}`
        }),
        email: (message) => ({
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: message || 'Invalid email format'
        }),
        regex: (pattern, message) => ({
            validate: (value) => pattern.test(value),
            message
        })
    },
    number: {
        min: (min, message) => ({
            validate: (value) => value >= min,
            message: message || `Minimum value is ${min}`
        }),
        max: (max, message) => ({
            validate: (value) => value <= max,
            message: message || `Maximum value is ${max}`
        }),
        positive: (message) => ({
            validate: (value) => value > 0,
            message: message || 'Value must be positive'
        }),
        integer: (message) => ({
            validate: (value) => Number.isInteger(value),
            message: message || 'Value must be an integer'
        })
    }
};
