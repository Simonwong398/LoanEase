"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLoanCost = void 0;
const mathUtils_1 = require("./mathUtils");
const analyzeLoanCost = (principal, rate, term, equalPayment, equalPrincipal) => {
    // 基础成本分析
    const totalCost = equalPayment.totalPayment;
    const interestCost = equalPayment.totalInterest;
    const monthlyBurden = equalPayment.monthlyPayment;
    const interestRatio = mathUtils_1.precise.divide(interestCost, principal);
    // 时间维度分析
    const yearlyStats = analyzeYearlyStats(equalPayment.schedule);
    // 利率敏感性分析
    const rateSensitivity = analyzeRateSensitivity(principal, rate, term);
    // 还款方式对比
    const methodComparison = {
        equalPayment,
        equalPrincipal,
        difference: {
            totalInterest: mathUtils_1.precise.subtract(equalPayment.totalInterest, equalPrincipal.totalInterest),
            maxMonthlyPayment: mathUtils_1.precise.subtract(equalPayment.monthlyPayment, equalPrincipal.schedule[0].payment),
            minMonthlyPayment: mathUtils_1.precise.subtract(equalPayment.monthlyPayment, equalPrincipal.schedule[equalPrincipal.schedule.length - 1].payment),
        },
    };
    return {
        totalCost,
        interestCost,
        monthlyBurden,
        interestRatio,
        yearlyInterest: yearlyStats.interest,
        yearlyPrincipal: yearlyStats.principal,
        yearlyPayment: yearlyStats.payment,
        rateSensitivity,
        methodComparison,
    };
};
exports.analyzeLoanCost = analyzeLoanCost;
// 分析年度统计数据
const analyzeYearlyStats = (schedule) => {
    const yearlyStats = {
        interest: [],
        principal: [],
        payment: [],
    };
    for (let year = 0; year < schedule.length / 12; year++) {
        const yearlyPayments = schedule.slice(year * 12, (year + 1) * 12);
        yearlyStats.interest.push(yearlyPayments.reduce((sum, item) => sum + item.interest, 0));
        yearlyStats.principal.push(yearlyPayments.reduce((sum, item) => sum + item.principal, 0));
        yearlyStats.payment.push(yearlyPayments.reduce((sum, item) => sum + item.payment, 0));
    }
    return yearlyStats;
};
// 分析利率敏感性
const analyzeRateSensitivity = (principal, baseRate, term) => {
    const variations = [-1, -0.5, 0, 0.5, 1]; // 利率变动百分点
    return variations.map(variation => {
        const newRate = baseRate + variation;
        const monthlyRate = newRate / 12 / 100;
        const months = term * 12;
        const monthlyPayment = mathUtils_1.precise.multiply(principal, mathUtils_1.precise.divide(mathUtils_1.precise.multiply(monthlyRate, Math.pow(1 + monthlyRate, months)), mathUtils_1.precise.subtract(Math.pow(1 + monthlyRate, months), 1)));
        const totalCost = monthlyPayment * months;
        return {
            rate: newRate,
            totalCost,
            monthlyPayment,
        };
    });
};
