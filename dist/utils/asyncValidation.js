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
exports.executeAsyncValidation = exports.asyncValidationRules = void 0;
const validationCache_1 = require("./validationCache");
exports.asyncValidationRules = {
    amount: [
        {
            validate: (value, context) => __awaiter(void 0, void 0, void 0, function* () {
                // 检查信用额度
                const creditLimit = yield checkCreditLimit(context === null || context === void 0 ? void 0 : context.userId);
                return Number(value) <= creditLimit;
            }),
            message: 'validation.amount.creditLimit',
        },
        {
            validate: (value) => __awaiter(void 0, void 0, void 0, function* () {
                // 检查历史交易限额
                const transactionLimit = yield checkTransactionLimit();
                return Number(value) <= transactionLimit;
            }),
            message: 'validation.amount.transactionLimit',
        },
    ],
    rate: [
        {
            validate: (value, context) => __awaiter(void 0, void 0, void 0, function* () {
                // 检查利率是否符合当前政策
                const ratePolicy = yield checkRatePolicy(context === null || context === void 0 ? void 0 : context.loanType);
                return Number(value) <= ratePolicy.maxRate;
            }),
            message: 'validation.rate.policyLimit',
        },
    ],
    term: [
        {
            validate: (value, context) => __awaiter(void 0, void 0, void 0, function* () {
                // 检查年龄限制
                const ageLimit = yield checkAgeLimit(context === null || context === void 0 ? void 0 : context.birthDate);
                const termInYears = Number(value);
                return termInYears <= ageLimit;
            }),
            message: 'validation.term.ageLimit',
        },
    ],
};
// 异步验证执行器
const executeAsyncValidation = (fieldName, value, context) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = validationCache_1.validationCache.getCacheKey(fieldName, value, context);
    const cachedResult = validationCache_1.validationCache.get(cacheKey);
    if (cachedResult !== null) {
        return cachedResult;
    }
    const rules = exports.asyncValidationRules[fieldName] || [];
    for (const rule of rules) {
        try {
            const isValid = yield rule.validate(value, context);
            if (!isValid) {
                validationCache_1.validationCache.set(cacheKey, rule.message, { value, context });
                return rule.message;
            }
        }
        catch (error) {
            console.error(`Validation error for ${fieldName}:`, error);
        }
    }
    validationCache_1.validationCache.set(cacheKey, undefined, { value, context });
    return undefined;
});
exports.executeAsyncValidation = executeAsyncValidation;
// 模拟异步API调用
function checkCreditLimit(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, 500));
        return 5000000;
    });
}
function checkTransactionLimit() {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, 300));
        return 10000000;
    });
}
function checkRatePolicy(loanType) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, 400));
        return { maxRate: loanType === 'providentFund' ? 3.1 : 4.65 };
    });
}
function checkAgeLimit(birthDate) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, 200));
        if (!birthDate)
            return 30;
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        return Math.min(70 - age, 30);
    });
}
