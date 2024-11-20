"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecommendation = exports.calculateFinancialMetrics = exports.analyzeSensitivity = void 0;
const loanCalculations_1 = require("./loanCalculations");
const mathUtils_1 = require("./mathUtils");
const analyzeSensitivity = (principal, rate, term, parameters) => {
    // 基准案例
    const baseline = (0, loanCalculations_1.calculateEqualPayment)(principal, rate, term);
    const analyses = [];
    // 利率敏感性分析
    if (parameters.rate) {
        const rateAnalysis = {
            parameter: 'rate',
            baselineValue: rate,
            results: parameters.rate.map(newRate => {
                const result = (0, loanCalculations_1.calculateEqualPayment)(principal, newRate, term);
                return {
                    value: newRate,
                    monthlyPayment: result.monthlyPayment,
                    totalInterest: result.totalInterest,
                    percentageChange: mathUtils_1.precise.multiply(mathUtils_1.precise.divide(mathUtils_1.precise.subtract(result.totalInterest, baseline.totalInterest), baseline.totalInterest), 100),
                };
            }),
        };
        analyses.push(rateAnalysis);
    }
    // 期限敏感性分析
    if (parameters.term) {
        const termAnalysis = {
            parameter: 'term',
            baselineValue: term,
            results: parameters.term.map(newTerm => {
                const result = (0, loanCalculations_1.calculateEqualPayment)(principal, rate, newTerm);
                return {
                    value: newTerm,
                    monthlyPayment: result.monthlyPayment,
                    totalInterest: result.totalInterest,
                    percentageChange: mathUtils_1.precise.multiply(mathUtils_1.precise.divide(mathUtils_1.precise.subtract(result.totalInterest, baseline.totalInterest), baseline.totalInterest), 100),
                };
            }),
        };
        analyses.push(termAnalysis);
    }
    return analyses;
};
exports.analyzeSensitivity = analyzeSensitivity;
const calculateFinancialMetrics = (loanDetails, prepaymentSavings) => {
    const monthlyIncome = loanDetails.monthlyIncome || 0;
    const propertyValue = loanDetails.propertyValue || loanDetails.principal;
    // 债务收入比
    const debtServiceRatio = monthlyIncome > 0 ?
        mathUtils_1.precise.divide(loanDetails.monthlyPayment, monthlyIncome) : 0;
    // 贷款价值比
    const loanToValue = mathUtils_1.precise.divide(loanDetails.principal, propertyValue);
    // 收支平衡点（月）
    const monthlyInterest = mathUtils_1.precise.divide(loanDetails.totalInterest, loanDetails.term * 12);
    const breakEvenPoint = Math.ceil(mathUtils_1.precise.divide(loanDetails.principal, mathUtils_1.precise.subtract(loanDetails.monthlyPayment, monthlyInterest)));
    // 实际年化利率
    const effectiveInterestRate = mathUtils_1.precise.multiply(mathUtils_1.precise.divide(loanDetails.totalInterest, mathUtils_1.precise.multiply(loanDetails.principal, loanDetails.term)), 100);
    // 借贷总成本
    const totalCostOfBorrowing = mathUtils_1.precise.add(loanDetails.totalInterest, mathUtils_1.precise.multiply(loanDetails.monthlyPayment, 0.001) // 假设每次还款手续费0.1%
    );
    return {
        debtServiceRatio,
        loanToValue,
        breakEvenPoint,
        effectiveInterestRate,
        totalCostOfBorrowing,
        savingsFromPrepayment: prepaymentSavings,
    };
};
exports.calculateFinancialMetrics = calculateFinancialMetrics;
const generateRecommendation = (metrics, loanType) => {
    let score = 100;
    const reasons = [];
    const risks = [];
    const suggestions = [];
    // 评估债务收入比
    if (metrics.debtServiceRatio > 0.5) {
        score -= 30;
        risks.push('debt_service_ratio_high');
        suggestions.push('consider_longer_term');
    }
    else if (metrics.debtServiceRatio > 0.4) {
        score -= 15;
        risks.push('debt_service_ratio_moderate');
        suggestions.push('monitor_expenses');
    }
    // 评估贷款价值比
    if (metrics.loanToValue > 0.8) {
        score -= 20;
        risks.push('high_ltv');
        suggestions.push('increase_down_payment');
    }
    // 评估实际利率
    if (metrics.effectiveInterestRate > 6) {
        score -= 10;
        risks.push('high_effective_rate');
        suggestions.push('consider_other_products');
    }
    // 根据贷类型给出具体建议
    if (loanType === 'commercialHouse') {
        if (metrics.loanToValue < 0.6) {
            reasons.push('good_down_payment');
        }
        suggestions.push('consider_combining_provident');
    }
    return {
        score,
        recommendation: score >= 80 ? 'strongly_recommended' :
            score >= 60 ? 'recommended_with_caution' :
                'consider_alternatives',
        reasons,
        risks,
        suggestions,
    };
};
exports.generateRecommendation = generateRecommendation;
