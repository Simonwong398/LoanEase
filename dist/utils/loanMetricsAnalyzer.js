"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLoanMetrics = void 0;
const mathUtils_1 = require("./mathUtils");
const analyzeLoanMetrics = (loan, context) => {
    const principal = loan.totalPayment - loan.totalInterest;
    // 基础指标
    const basic = {
        monthlyPayment: loan.monthlyPayment,
        totalPayment: loan.totalPayment,
        totalInterest: loan.totalInterest,
        interestRatio: mathUtils_1.precise.divide(loan.totalInterest, principal),
    };
    // 可负担性指标
    const affordability = {
        debtToIncome: mathUtils_1.precise.divide(loan.monthlyPayment, context.monthlyIncome),
        paymentToIncome: mathUtils_1.precise.divide(loan.monthlyPayment * 12, context.monthlyIncome * 12),
        loanToValue: mathUtils_1.precise.divide(principal, context.propertyValue),
        affordabilityScore: calculateAffordabilityScore(loan, context),
    };
    // 风险指标
    const risk = {
        interestRateRisk: calculateInterestRateRisk(loan, context),
        prepaymentRisk: calculatePrepaymentRisk(loan),
        termRisk: calculateTermRisk(loan),
        overallRisk: 0, // 将在后面计算
    };
    risk.overallRisk = (risk.interestRateRisk + risk.prepaymentRisk + risk.termRisk) / 3;
    // 效率指标
    const efficiency = {
        interestEfficiency: calculateInterestEfficiency(loan, context),
        termEfficiency: calculateTermEfficiency(loan),
        paymentEfficiency: calculatePaymentEfficiency(loan, context),
        overallEfficiency: 0, // 将在后面计算
    };
    efficiency.overallEfficiency = (efficiency.interestEfficiency +
        efficiency.termEfficiency +
        efficiency.paymentEfficiency) / 3;
    // 比较指标
    const comparison = {
        marketComparison: calculateMarketComparison(loan, context),
        industryAverage: calculateIndustryAverage(loan),
        optimalScenario: calculateOptimalScenario(loan, context),
        potentialSavings: calculatePotentialSavings(loan, context),
    };
    return {
        basic,
        affordability,
        risk,
        efficiency,
        comparison,
    };
};
exports.analyzeLoanMetrics = analyzeLoanMetrics;
// 辅助函数
function calculateAffordabilityScore(loan, context) {
    const paymentRatio = loan.monthlyPayment / context.monthlyIncome;
    if (paymentRatio <= 0.3)
        return 100;
    if (paymentRatio <= 0.4)
        return 80;
    if (paymentRatio <= 0.5)
        return 60;
    if (paymentRatio <= 0.6)
        return 40;
    return 20;
}
function calculateInterestRateRisk(loan, context) {
    const rateDiff = Math.abs(loan.rate - context.marketRate);
    if (rateDiff <= 0.1)
        return 20;
    if (rateDiff <= 0.5)
        return 40;
    if (rateDiff <= 1.0)
        return 60;
    if (rateDiff <= 2.0)
        return 80;
    return 100;
}
function calculatePrepaymentRisk(loan) {
    const remainingMonths = loan.schedule.length;
    if (remainingMonths <= 60)
        return 20; // 5年以内
    if (remainingMonths <= 120)
        return 40; // 10年以内
    if (remainingMonths <= 180)
        return 60; // 15年以内
    if (remainingMonths <= 240)
        return 80; // 20年以内
    return 100;
}
function calculateTermRisk(loan) {
    const months = loan.schedule.length;
    if (months <= 120)
        return 20; // 10年以内
    if (months <= 180)
        return 40; // 15年以内
    if (months <= 240)
        return 60; // 20年以内
    if (months <= 300)
        return 80; // 25年以内
    return 100;
}
function calculateInterestEfficiency(loan, context) {
    const marketInterest = loan.totalPayment * (context.marketRate / 100);
    const actualInterest = loan.totalInterest;
    return 100 - (actualInterest - marketInterest) / marketInterest * 100;
}
function calculateTermEfficiency(loan) {
    const optimalTerm = 180; // 15年作为最优期限
    const actualTerm = loan.schedule.length;
    const diff = Math.abs(actualTerm - optimalTerm);
    return Math.max(0, 100 - (diff / optimalTerm) * 100);
}
function calculatePaymentEfficiency(loan, context) {
    const optimalPayment = context.monthlyIncome * 0.3;
    const actualPayment = loan.monthlyPayment;
    const diff = Math.abs(actualPayment - optimalPayment);
    return Math.max(0, 100 - (diff / optimalPayment) * 100);
}
function calculateMarketComparison(loan, context) {
    return (context.marketRate - loan.rate) * 100;
}
function calculateIndustryAverage(loan) {
    // 这里应该从外部数据源获取行业平均值
    return 0;
}
function calculateOptimalScenario(loan, context) {
    // 计算最优情况下的成本
    return 0;
}
function calculatePotentialSavings(loan, context) {
    // 计算潜在节省金额
    return 0;
}
