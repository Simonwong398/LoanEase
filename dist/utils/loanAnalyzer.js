"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLoan = void 0;
const mathUtils_1 = require("./mathUtils");
const analyzeLoan = (loan, context) => {
    const principal = loan.totalPayment - loan.totalInterest;
    // 基础分析
    const basic = {
        monthlyPayment: loan.monthlyPayment,
        totalPayment: loan.totalPayment,
        totalInterest: loan.totalInterest,
        interestRatio: mathUtils_1.precise.divide(loan.totalInterest, principal),
    };
    // 趋势分析
    const trends = {
        principalTrend: loan.schedule.map(s => s.principal),
        interestTrend: loan.schedule.map(s => s.interest),
        remainingBalanceTrend: loan.schedule.map(s => s.remainingBalance),
    };
    // 指标分析
    const metrics = {
        debtIncomeRatio: mathUtils_1.precise.divide(loan.monthlyPayment, context.monthlyIncome),
        paymentToIncome: mathUtils_1.precise.divide(loan.monthlyPayment * 12, context.monthlyIncome * 12),
        loanToValue: mathUtils_1.precise.divide(principal, context.propertyValue),
        breakEvenPoint: calculateBreakEvenPoint(loan),
    };
    // 风险评估
    const risks = {
        interestRateRisk: assessInterestRateRisk(loan),
        affordabilityRisk: assessAffordabilityRisk(metrics.paymentToIncome),
        termRisk: assessTermRisk(loan.schedule.length),
    };
    // 优化建议
    const optimization = {
        recommendedTerm: calculateOptimalTerm(loan, context),
        recommendedPayment: calculateOptimalPayment(loan, context),
        potentialSavings: calculatePotentialSavings(loan),
        prepaymentBenefit: calculatePrepaymentBenefit(loan),
    };
    return {
        basic,
        trends,
        metrics,
        risks,
        optimization,
    };
};
exports.analyzeLoan = analyzeLoan;
// 辅助函数
function calculateBreakEvenPoint(loan) {
    // 实现损益平衡点计算
    return 0;
}
function assessInterestRateRisk(loan) {
    // 实现利率风险评估
    return 'medium';
}
function assessAffordabilityRisk(paymentToIncome) {
    if (paymentToIncome <= 0.3)
        return 'low';
    if (paymentToIncome <= 0.5)
        return 'medium';
    return 'high';
}
function assessTermRisk(months) {
    if (months <= 180)
        return 'low'; // 15年以下
    if (months <= 300)
        return 'medium'; // 25年以下
    return 'high';
}
function calculateOptimalTerm(loan, context) {
    // 实现最优贷款期限计算
    return 0;
}
function calculateOptimalPayment(loan, context) {
    // 实现最优月供计算
    return 0;
}
function calculatePotentialSavings(loan) {
    // 实现潜在节省计算
    return 0;
}
function calculatePrepaymentBenefit(loan) {
    // 实现提前还款收益计算
    return 0;
}
