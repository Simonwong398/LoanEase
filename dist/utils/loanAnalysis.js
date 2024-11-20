"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeLoan = void 0;
const mathUtils_1 = require("./mathUtils");
const analyzeLoan = (method, monthlyIncome, inflationRate = 0.03, // 默认通胀率3%
investmentReturn = 0.06 // 默认投资回报率6%
) => {
    // 月收入占比（月供/月收入）
    const monthlyIncomeRatio = mathUtils_1.precise.divide(method.monthlyPayment, monthlyIncome);
    // 总成本比例（总利息/本金）
    const totalCostRatio = mathUtils_1.precise.divide(method.totalInterest, method.totalPayment - method.totalInterest);
    // 潜在利息节省（如果提前还款）
    const interestSavingsPotential = calculatePotentialSavings(method);
    // 还款灵活度（基于期限和月供）
    const paymentFlexibility = calculateFlexibility(method);
    // 风险水平（基于各种因素的综合评分）
    const riskLevel = calculateRiskLevel(method, monthlyIncomeRatio);
    // 收支平衡点（月）
    const breakEvenPoint = calculateBreakEvenPoint(method);
    // 机会成本（如果资金用于投资）
    const opportunityCost = calculateOpportunityCost(method, investmentReturn);
    // 通货膨胀影响
    const inflationImpact = calculateInflationImpact(method, inflationRate);
    return {
        monthlyIncomeRatio,
        totalCostRatio,
        interestSavingsPotential,
        paymentFlexibility,
        riskLevel,
        breakEvenPoint,
        opportunityCost,
        inflationImpact,
    };
};
exports.analyzeLoan = analyzeLoan;
// 计算潜在利息节省
const calculatePotentialSavings = (method) => {
    const halfTerm = Math.floor(method.schedule.length / 2);
    const remainingInterest = method.schedule
        .slice(halfTerm)
        .reduce((sum, item) => sum + item.interest, 0);
    return mathUtils_1.precise.divide(remainingInterest, method.totalInterest);
};
// 计算还款灵活度
const calculateFlexibility = (method) => {
    const termFlexibility = mathUtils_1.precise.divide(method.schedule.length, 360); // 最长30年
    const paymentFlexibility = mathUtils_1.precise.divide(method.monthlyPayment, method.schedule[0].payment);
    return mathUtils_1.precise.multiply(mathUtils_1.precise.add(termFlexibility, paymentFlexibility), 0.5);
};
// 计算风险水平
const calculateRiskLevel = (method, monthlyIncomeRatio) => {
    const incomeRiskFactor = monthlyIncomeRatio > 0.5 ? 0.4 : 0.2;
    const termRiskFactor = method.schedule.length > 240 ? 0.3 : 0.1;
    const interestRiskFactor = mathUtils_1.precise.divide(method.totalInterest, method.totalPayment) > 0.4 ? 0.3 : 0.1;
    return mathUtils_1.precise.add(mathUtils_1.precise.add(incomeRiskFactor, termRiskFactor), interestRiskFactor);
};
// 计算收支平衡点
const calculateBreakEvenPoint = (method) => {
    let totalPaid = 0;
    let breakEvenMonth = 0;
    const principal = method.totalPayment - method.totalInterest;
    for (let i = 0; i < method.schedule.length; i++) {
        totalPaid += method.schedule[i].principal;
        if (totalPaid >= principal / 2) {
            breakEvenMonth = i + 1;
            break;
        }
    }
    return breakEvenMonth;
};
// 计算机会成本
const calculateOpportunityCost = (method, investmentReturn) => {
    const monthlyRate = mathUtils_1.precise.divide(investmentReturn, 12);
    let opportunityCost = 0;
    for (let i = 0; i < method.schedule.length; i++) {
        const payment = method.schedule[i].payment;
        const futureValue = payment * Math.pow(1 + monthlyRate, method.schedule.length - i);
        opportunityCost += futureValue;
    }
    return mathUtils_1.precise.subtract(opportunityCost, method.totalPayment);
};
// 计算通货膨胀影响
const calculateInflationImpact = (method, inflationRate) => {
    const monthlyInflation = mathUtils_1.precise.divide(inflationRate, 12);
    let realCost = 0;
    for (let i = 0; i < method.schedule.length; i++) {
        const payment = method.schedule[i].payment;
        const presentValue = payment / Math.pow(1 + monthlyInflation, i);
        realCost += presentValue;
    }
    return mathUtils_1.precise.subtract(method.totalPayment, realCost);
};
