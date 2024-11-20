"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
class ValidationService {
    static validate(value, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            for (const rule of rules) {
                const isValid = yield rule.validate(value);
                if (!isValid) {
                    errors.push(rule.message);
                }
            }
            return errors;
        });
    }
}
exports.ValidationService = ValidationService;
// 贷款金额验证规则
ValidationService.loanAmountRules = [
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
ValidationService.loanTermRules = [
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
ValidationService.documentRules = [
    {
        validate: (file) => file.length > 0,
        message: 'File cannot be empty'
    },
    {
        validate: (file) => file.length <= 10 * 1024 * 1024, // 10MB
        message: 'File size cannot exceed 10MB'
    }
];
