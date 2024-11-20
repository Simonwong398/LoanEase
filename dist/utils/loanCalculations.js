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
exports.calculatePaymentSchedules = exports.calculateLoan = exports.calculateCombinedLoan = exports.calculateWithPrepayment = exports.generateAmortizationSchedule = exports.calculateEqualPrincipal = exports.calculateEqualPayment = void 0;
const mathUtils_1 = require("./mathUtils");
const calculationOptimizer_1 = require("./calculationOptimizer");
// 等额本息计算
const calculateEqualPayment = (principal, annualRate, years) => {
    // 验证输入
    if (principal <= 0)
        throw new Error('Principal must be positive');
    if (annualRate < 0)
        throw new Error('Rate cannot be negative');
    if (years <= 0)
        throw new Error('Term must be positive');
    const monthlyRate = mathUtils_1.precise.divide(mathUtils_1.precise.divide(annualRate, 12), 100);
    const months = years * 12;
    // 计算月供
    const monthlyPayment = mathUtils_1.precise.multiply(principal, mathUtils_1.precise.divide(mathUtils_1.precise.multiply(monthlyRate, Math.pow(1 + monthlyRate, months)), mathUtils_1.precise.subtract(Math.pow(1 + monthlyRate, months), 1)));
    const schedule = [];
    let remainingBalance = principal;
    let totalPayment = 0;
    for (let month = 1; month <= months; month++) {
        const interest = mathUtils_1.precise.multiply(remainingBalance, monthlyRate);
        const principalPayment = mathUtils_1.precise.subtract(monthlyPayment, interest);
        remainingBalance = mathUtils_1.precise.subtract(remainingBalance, principalPayment);
        totalPayment = mathUtils_1.precise.add(totalPayment, monthlyPayment);
        schedule.push({
            month,
            payment: mathUtils_1.precise.round(monthlyPayment),
            principal: mathUtils_1.precise.round(principalPayment),
            interest: mathUtils_1.precise.round(interest),
            remainingBalance: mathUtils_1.precise.round(Math.max(0, remainingBalance)),
        });
    }
    return {
        monthlyPayment: mathUtils_1.precise.round(monthlyPayment),
        totalPayment: mathUtils_1.precise.round(totalPayment),
        totalInterest: mathUtils_1.precise.round(mathUtils_1.precise.subtract(totalPayment, principal)),
        schedule,
    };
};
exports.calculateEqualPayment = calculateEqualPayment;
// 等额本金计算
const calculateEqualPrincipal = (principal, annualRate, years) => {
    // 验证输入
    if (principal <= 0)
        throw new Error('Principal must be positive');
    if (annualRate < 0)
        throw new Error('Rate cannot be negative');
    if (years <= 0)
        throw new Error('Term must be positive');
    const monthlyRate = mathUtils_1.precise.divide(mathUtils_1.precise.divide(annualRate, 12), 100);
    const months = years * 12;
    const monthlyPrincipal = mathUtils_1.precise.divide(principal, months);
    const schedule = [];
    let remainingBalance = principal;
    let totalPayment = 0;
    for (let month = 1; month <= months; month++) {
        const interest = mathUtils_1.precise.multiply(remainingBalance, monthlyRate);
        const payment = mathUtils_1.precise.add(monthlyPrincipal, interest);
        remainingBalance = mathUtils_1.precise.subtract(remainingBalance, monthlyPrincipal);
        totalPayment = mathUtils_1.precise.add(totalPayment, payment);
        schedule.push({
            month,
            payment: mathUtils_1.precise.round(payment),
            principal: mathUtils_1.precise.round(monthlyPrincipal),
            interest: mathUtils_1.precise.round(interest),
            remainingBalance: mathUtils_1.precise.round(Math.max(0, remainingBalance)),
        });
    }
    return {
        monthlyPayment: mathUtils_1.precise.round(schedule[0].payment),
        totalPayment: mathUtils_1.precise.round(totalPayment),
        totalInterest: mathUtils_1.precise.round(mathUtils_1.precise.subtract(totalPayment, principal)),
        schedule,
    };
};
exports.calculateEqualPrincipal = calculateEqualPrincipal;
// 添加通用的分期计算函数
const generateAmortizationSchedule = (principal, annualRate, years) => {
    return (0, exports.calculateEqualPayment)(principal, annualRate, years).schedule;
};
exports.generateAmortizationSchedule = generateAmortizationSchedule;
// 计算提前还款后的还款计划
const calculateWithPrepayment = (principal, annualRate, years, prepayment) => {
    // 验证输入
    if (prepayment.amount >= principal) {
        throw new Error('Prepayment amount cannot exceed principal');
    }
    if (prepayment.month >= years * 12) {
        throw new Error('Prepayment month cannot exceed loan term');
    }
    const monthlyRate = mathUtils_1.precise.divide(mathUtils_1.precise.divide(annualRate, 12), 100);
    const totalMonths = years * 12;
    const schedule = [];
    let remainingBalance = principal;
    let totalPayment = 0;
    // 计算原始月供
    const originalMonthlyPayment = mathUtils_1.precise.multiply(principal, mathUtils_1.precise.divide(mathUtils_1.precise.multiply(monthlyRate, Math.pow(1 + monthlyRate, totalMonths)), mathUtils_1.precise.subtract(Math.pow(1 + monthlyRate, totalMonths), 1)));
    // 计算提前还款前的还款计划
    for (let month = 1; month <= prepayment.month; month++) {
        const interest = mathUtils_1.precise.multiply(remainingBalance, monthlyRate);
        const principalPayment = mathUtils_1.precise.subtract(originalMonthlyPayment, interest);
        remainingBalance = mathUtils_1.precise.subtract(remainingBalance, principalPayment);
        totalPayment = mathUtils_1.precise.add(totalPayment, originalMonthlyPayment);
        schedule.push({
            month,
            payment: mathUtils_1.precise.round(originalMonthlyPayment),
            principal: mathUtils_1.precise.round(principalPayment),
            interest: mathUtils_1.precise.round(interest),
            remainingBalance: mathUtils_1.precise.round(remainingBalance),
        });
    }
    // 处理提前还款
    remainingBalance = mathUtils_1.precise.subtract(remainingBalance, prepayment.amount);
    totalPayment = mathUtils_1.precise.add(totalPayment, prepayment.amount);
    if (prepayment.method === 'reduce_term') {
        // 减少期限，月供不变
        const newMonths = Math.ceil(Math.log(originalMonthlyPayment / (originalMonthlyPayment - remainingBalance * monthlyRate)) /
            Math.log(1 + monthlyRate));
        for (let month = prepayment.month + 1; month <= newMonths; month++) {
            const interest = remainingBalance * monthlyRate;
            const principalPayment = originalMonthlyPayment - interest;
            remainingBalance -= principalPayment;
            totalPayment += originalMonthlyPayment;
            schedule.push({
                month,
                payment: originalMonthlyPayment,
                principal: principalPayment,
                interest,
                remainingBalance: Math.max(0, remainingBalance),
            });
        }
    }
    else {
        // 减少月供，期限不变
        const newMonthlyPayment = (remainingBalance * monthlyRate * Math.pow(1 + monthlyRate, totalMonths - prepayment.month)) /
            (Math.pow(1 + monthlyRate, totalMonths - prepayment.month) - 1);
        for (let month = prepayment.month + 1; month <= totalMonths; month++) {
            const interest = remainingBalance * monthlyRate;
            const principalPayment = newMonthlyPayment - interest;
            remainingBalance -= principalPayment;
            totalPayment += newMonthlyPayment;
            schedule.push({
                month,
                payment: newMonthlyPayment,
                principal: principalPayment,
                interest,
                remainingBalance: Math.max(0, remainingBalance),
            });
        }
    }
    return {
        monthlyPayment: mathUtils_1.precise.round(schedule[0].payment),
        totalPayment: mathUtils_1.precise.round(totalPayment),
        totalInterest: mathUtils_1.precise.round(mathUtils_1.precise.subtract(totalPayment, principal)),
        schedule,
    };
};
exports.calculateWithPrepayment = calculateWithPrepayment;
// 计算组合贷款
const calculateCombinedLoan = (commercial, providentFund, years) => {
    const commercialResult = (0, exports.calculateEqualPayment)(commercial.amount, commercial.rate, years);
    const providentFundResult = (0, exports.calculateEqualPayment)(providentFund.amount, providentFund.rate, years);
    return {
        commercial: commercialResult,
        providentFund: providentFundResult,
        combined: {
            monthlyPayment: commercialResult.monthlyPayment + providentFundResult.monthlyPayment,
            totalPayment: commercialResult.totalPayment + providentFundResult.totalPayment,
            totalInterest: commercialResult.totalInterest + providentFundResult.totalInterest,
        },
    };
};
exports.calculateCombinedLoan = calculateCombinedLoan;
// 优化贷款计算
const calculateLoan = (params) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, calculationOptimizer_1.optimizedCalculation)('calculateLoan', params, () => {
        // 原有的计算逻辑
        return (0, exports.calculateEqualPayment)(params.principal, params.rate, params.term);
    }, {
        useCache: true,
        priority: 'speed',
        timeout: 3000,
    });
});
exports.calculateLoan = calculateLoan;
// 批量计算还款计划
const calculatePaymentSchedules = (loans) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, calculationOptimizer_1.batchCalculate)(loans, (loan) => (0, exports.calculateLoan)(loan), 5 // 每批处理5个贷款
    );
});
exports.calculatePaymentSchedules = calculatePaymentSchedules;
