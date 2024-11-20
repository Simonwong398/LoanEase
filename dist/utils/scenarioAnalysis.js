"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultScenarios = exports.analyzeScenarios = void 0;
const loanCalculations_1 = require("./loanCalculations");
const mathUtils_1 = require("./mathUtils");
const analyzeScenarios = (scenarios) => {
    // 计算每个场景的结果
    const calculatedScenarios = scenarios.map(scenario => (Object.assign(Object.assign({}, scenario), { result: (0, loanCalculations_1.calculateEqualPayment)(scenario.parameters.principal, scenario.parameters.rate, scenario.parameters.term) })));
    // 计算场景之间的差异
    const baseScenario = calculatedScenarios[0];
    const differences = {
        monthlyPayment: calculatedScenarios.map(scenario => mathUtils_1.precise.subtract(scenario.result.monthlyPayment, baseScenario.result.monthlyPayment)),
        totalInterest: calculatedScenarios.map(scenario => mathUtils_1.precise.subtract(scenario.result.totalInterest, baseScenario.result.totalInterest)),
        percentageDiff: calculatedScenarios.map(scenario => mathUtils_1.precise.multiply(mathUtils_1.precise.divide(mathUtils_1.precise.subtract(scenario.result.totalInterest, baseScenario.result.totalInterest), baseScenario.result.totalInterest), 100)),
    };
    // 生成建议
    const recommendation = generateRecommendation(calculatedScenarios, differences);
    return {
        scenarios: calculatedScenarios,
        differences,
        recommendation,
    };
};
exports.analyzeScenarios = analyzeScenarios;
const generateRecommendation = (scenarios, differences) => {
    // 找出总利息最低的场景
    const lowestInterestIndex = differences.totalInterest
        .map((diff, index) => ({ diff, index }))
        .sort((a, b) => a.diff - b.diff)[0].index;
    // 找出月供最低的场景
    const lowestPaymentIndex = differences.monthlyPayment
        .map((diff, index) => ({ diff, index }))
        .sort((a, b) => a.diff - b.diff)[0].index;
    if (lowestInterestIndex === lowestPaymentIndex) {
        return `scenario_best_overall_${scenarios[lowestInterestIndex].id}`;
    }
    else {
        return `scenario_tradeoff_${scenarios[lowestInterestIndex].id}_${scenarios[lowestPaymentIndex].id}`;
    }
};
// 预定义场景
const getDefaultScenarios = (baseAmount, baseRate) => [
    {
        id: 'base',
        name: 'scenario.base.name',
        description: 'scenario.base.description',
        parameters: {
            principal: baseAmount,
            rate: baseRate,
            term: 30,
        },
    },
    {
        id: 'shorter_term',
        name: 'scenario.shorter_term.name',
        description: 'scenario.shorter_term.description',
        parameters: {
            principal: baseAmount,
            rate: baseRate,
            term: 20,
        },
    },
    {
        id: 'higher_down_payment',
        name: 'scenario.higher_down_payment.name',
        description: 'scenario.higher_down_payment.description',
        parameters: {
            principal: baseAmount * 0.8,
            rate: baseRate,
            term: 30,
        },
    },
    {
        id: 'combined_loan',
        name: 'scenario.combined_loan.name',
        description: 'scenario.combined_loan.description',
        parameters: {
            principal: baseAmount,
            rate: baseRate * 0.9, // 假设组合贷款能降低平均利率
            term: 30,
        },
    },
];
exports.getDefaultScenarios = getDefaultScenarios;
