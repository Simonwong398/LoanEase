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
exports.FormValidator = void 0;
const mathUtils_1 = require("./mathUtils");
class FormValidator {
    static validateField(field) {
        if (!field.touched)
            return undefined;
        for (const rule of field.rules) {
            if (!rule.test(field.value)) {
                return rule.message;
            }
        }
        return undefined;
    }
    static validateForm(formState) {
        return Object.values(formState).every(field => {
            const error = this.validateField(field);
            return !error;
        });
    }
    static getFieldRules(fieldName, context) {
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
                        var _a;
                        const decimalPlaces = ((_a = value.toString().split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) || 0;
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
                        if (!(context === null || context === void 0 ? void 0 : context.monthlyPayment))
                            return true;
                        return (context.monthlyPayment / Number(value)) <= 0.5;
                    },
                    message: 'validation.monthlyIncome.debtRatio',
                },
            ],
        };
        if ((context === null || context === void 0 ? void 0 : context.loanType) === 'providentFund') {
            baseRules.amount.push({
                test: (value) => Number(value) <= 1200000,
                message: 'validation.amount.providentFundLimit',
            });
        }
        return baseRules[fieldName] || [];
    }
    static getCombinedRules(fields) {
        return [
            {
                test: () => {
                    const totalAmount = Number(fields.totalAmount || 0);
                    const downPayment = Number(fields.downPayment || 0);
                    const loanAmount = Number(fields.amount || 0);
                    return mathUtils_1.precise.add(loanAmount, downPayment) === totalAmount;
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
    static validateAsync(field, context) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (field.value) {
                case 'amount':
                    try {
                        const creditLimit = yield checkCreditLimit();
                        if (Number(field.value) > creditLimit) {
                            return 'validation.amount.creditLimit';
                        }
                    }
                    catch (error) {
                        console.error('Credit check failed:', error);
                    }
                    break;
            }
            return undefined;
        });
    }
}
exports.FormValidator = FormValidator;
function checkCreditLimit() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            setTimeout(() => resolve(5000000), 1000);
        });
    });
}
