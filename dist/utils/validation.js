"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLoanInput = void 0;
const errorHandling_1 = require("./errorHandling");
const loanTypes_1 = require("../config/loanTypes");
const validateLoanInput = (amount, rate, term, loanType, rules) => {
    const loanConfig = loanTypes_1.loanTypes[loanType];
    const defaultRules = {
        amount: {
            min: (loanConfig === null || loanConfig === void 0 ? void 0 : loanConfig.minAmount) || 1000,
            max: (loanConfig === null || loanConfig === void 0 ? void 0 : loanConfig.maxAmount) || 10000000,
        },
        rate: {
            min: 0,
            max: 24, // 最高年利率24%
        },
        term: {
            min: 1,
            max: (loanConfig === null || loanConfig === void 0 ? void 0 : loanConfig.maxTerm) || 30,
        },
    };
    const validationRules = rules || defaultRules;
    // 验证金额
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue)) {
        throw new errorHandling_1.LoanCalculationError('Invalid loan amount', errorHandling_1.ErrorCodes.INVALID_AMOUNT, 'amount');
    }
    if (amountValue < validationRules.amount.min) {
        throw new errorHandling_1.LoanCalculationError(`Loan amount must be at least ${validationRules.amount.min}`, errorHandling_1.ErrorCodes.AMOUNT_TOO_LOW, 'amount');
    }
    if (amountValue > validationRules.amount.max) {
        throw new errorHandling_1.LoanCalculationError(`Loan amount cannot exceed ${validationRules.amount.max}`, errorHandling_1.ErrorCodes.AMOUNT_TOO_HIGH, 'amount');
    }
    // 验证利率
    const rateValue = parseFloat(rate);
    if (!rate || isNaN(rateValue)) {
        throw new errorHandling_1.LoanCalculationError('Invalid interest rate', errorHandling_1.ErrorCodes.INVALID_RATE, 'rate');
    }
    if (rateValue < validationRules.rate.min || rateValue > validationRules.rate.max) {
        throw new errorHandling_1.LoanCalculationError(`Interest rate must be between ${validationRules.rate.min}% and ${validationRules.rate.max}%`, errorHandling_1.ErrorCodes.RATE_TOO_HIGH, 'rate');
    }
    // 验证期限
    const termValue = parseFloat(term);
    if (!term || isNaN(termValue)) {
        throw new errorHandling_1.LoanCalculationError('Invalid loan term', errorHandling_1.ErrorCodes.INVALID_TERM, 'term');
    }
    if (termValue < validationRules.term.min || termValue > validationRules.term.max) {
        throw new errorHandling_1.LoanCalculationError(`Loan term must be between ${validationRules.term.min} and ${validationRules.term.max} years`, errorHandling_1.ErrorCodes.TERM_TOO_LONG, 'term');
    }
    return {
        amount: amountValue,
        rate: rateValue,
        term: termValue,
    };
};
exports.validateLoanInput = validateLoanInput;
