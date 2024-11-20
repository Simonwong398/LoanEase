"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanPlanRecommender = void 0;
const mathUtils_1 = require("./mathUtils");
class LoanPlanRecommender {
    static recommendPlan(plans, criteria) {
        const scores = plans.map(plan => {
            const details = {
                plan,
                monthlyBurden: this.calculateMonthlyBurdenScore(plan, criteria.monthlyIncome),
                totalInterest: this.calculateTotalInterestScore(plan, plans),
                flexibility: this.calculateFlexibilityScore(plan),
                termMatch: this.calculateTermMatchScore(plan, criteria.preferredTerm),
            };
            const totalScore = this.calculateTotalScore(details, criteria);
            const recommendation = this.generateRecommendations(details, criteria);
            return {
                plan,
                totalScore,
                details,
                recommendation,
            };
        });
        return scores.sort((a, b) => b.totalScore - a.totalScore);
    }
    static calculateMonthlyBurdenScore(plan, monthlyIncome) {
        if (!monthlyIncome)
            return 0.5;
        const burdenRatio = plan.data.monthlyPayment / monthlyIncome;
        if (burdenRatio <= 0.3) {
            return 1.0;
        }
        else if (burdenRatio <= 0.4) {
            return 0.8;
        }
        else if (burdenRatio <= 0.5) {
            return 0.6;
        }
        else if (burdenRatio <= 0.6) {
            return 0.3;
        }
        else {
            return 0;
        }
    }
    static calculateTotalInterestScore(plan, allPlans) {
        const maxInterest = Math.max(...allPlans.map(p => p.data.totalInterest));
        const minInterest = Math.min(...allPlans.map(p => p.data.totalInterest));
        const range = maxInterest - minInterest;
        if (range === 0)
            return 1;
        const normalizedScore = 1 - ((plan.data.totalInterest - minInterest) / range);
        return 1 / (1 + Math.exp(-10 * (normalizedScore - 0.5)));
    }
    static calculateFlexibilityScore(plan) {
        const payments = plan.data.schedule.map(item => item.payment);
        const variation = Math.max(...payments) - Math.min(...payments);
        const avgPayment = payments.reduce((a, b) => a + b) / payments.length;
        const variationRatio = variation / avgPayment;
        const prepaymentFlexibility = this.calculatePrepaymentFlexibility(plan);
        return mathUtils_1.precise.multiply(mathUtils_1.precise.add(mathUtils_1.precise.multiply(1 - variationRatio, 0.6), mathUtils_1.precise.multiply(prepaymentFlexibility, 0.4)), 1);
    }
    static calculatePrepaymentFlexibility(plan) {
        const firstYearInterest = plan.data.schedule
            .slice(0, 12)
            .reduce((sum, item) => sum + item.interest, 0);
        const totalInterest = plan.data.totalInterest;
        const frontLoadRatio = firstYearInterest / totalInterest;
        return frontLoadRatio;
    }
    static calculateTermMatchScore(plan, preferredTerm) {
        if (!preferredTerm)
            return 0.5;
        const actualTerm = plan.data.schedule.length / 12;
        const difference = Math.abs(actualTerm - preferredTerm);
        return Math.exp(-Math.pow(difference, 2) / (2 * Math.pow(preferredTerm * 0.1, 2)));
    }
    static calculateStabilityScore(plan) {
        const payments = plan.data.schedule.map(item => item.payment);
        const mean = payments.reduce((a, b) => a + b) / payments.length;
        const variance = payments.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / payments.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = standardDeviation / mean;
        return Math.max(0, 1 - coefficientOfVariation);
    }
    static calculateRiskScore(plan, monthlyIncome) {
        const scores = [];
        let weights = [];
        if (monthlyIncome) {
            const burdenRatio = plan.data.monthlyPayment / monthlyIncome;
            scores.push(Math.max(0, 1 - burdenRatio));
            weights.push(0.4);
        }
        const termRisk = Math.max(0, 1 - (plan.data.schedule.length / (30 * 12)));
        scores.push(termRisk);
        weights.push(0.3);
        const interestRatio = plan.data.totalInterest / plan.data.totalPayment;
        const interestRisk = Math.max(0, 1 - (interestRatio * 2));
        scores.push(interestRisk);
        weights.push(0.3);
        return scores.reduce((sum, score, index) => sum + score * weights[index], 0) /
            weights.reduce((a, b) => a + b, 0);
    }
    static calculateTotalScore(details, criteria) {
        const weights = this.RISK_WEIGHTS[criteria.riskTolerance || 'medium'];
        const stabilityScore = this.calculateStabilityScore(details.plan);
        const riskScore = this.calculateRiskScore(details.plan, criteria.monthlyIncome);
        const adjustedWeights = Object.assign({}, weights);
        if (criteria.prioritizeLowMonthly) {
            adjustedWeights.monthlyBurden *= 1.5;
            adjustedWeights.totalInterest *= 0.8;
        }
        const numericMetrics = {
            monthlyBurden: details.monthlyBurden,
            totalInterest: details.totalInterest,
            flexibility: details.flexibility,
            termMatch: details.termMatch,
            stabilityScore,
            riskScore,
        };
        return Object.entries(adjustedWeights)
            .filter(([key]) => key in numericMetrics)
            .reduce((total, [key, weight]) => {
            const score = numericMetrics[key];
            return mathUtils_1.precise.add(total, mathUtils_1.precise.multiply(score, weight));
        }, 0);
    }
    static generateRecommendations(details, criteria) {
        const recommendations = [];
        if (details.monthlyBurden < 0.3) {
            recommendations.push('月供压力较小，适合您的收入水平');
        }
        else if (details.monthlyBurden > 0.5) {
            recommendations.push('月供压力较大，建议考虑延长贷款期限或增加首付');
        }
        if (details.totalInterest < 0.3) {
            recommendations.push('总利息成本较低，是经济实惠的选择');
        }
        else if (details.totalInterest > 0.7) {
            recommendations.push('总利息成本较高，建议考虑提前还款或其他还款方式');
        }
        if (details.flexibility > 0.8) {
            recommendations.push('还款计划灵活性高，适合收入不稳定的情况');
        }
        if (details.termMatch > 0.9) {
            recommendations.push('贷款期限与您的预期非常匹配');
        }
        return recommendations;
    }
    static analyzeHistoricalData(previousScores, currentScore) {
        const averageScore = previousScores.reduce((sum, score) => sum + score.totalScore, 0) / previousScores.length;
        const calculateTrend = (metric) => {
            const previousValues = previousScores.map(score => score.details[metric]);
            const currentValue = currentScore.details[metric];
            if (typeof currentValue === 'number') {
                const numericValues = previousValues.filter((val) => typeof val === 'number');
                const avgPrevious = numericValues.reduce((sum, val) => sum + val, 0) /
                    numericValues.length;
                return mathUtils_1.precise.divide(mathUtils_1.precise.subtract(currentValue, avgPrevious), avgPrevious) * 100;
            }
            return 0;
        };
        const trendAnalysis = {
            monthlyBurdenTrend: calculateTrend('monthlyBurden'),
            totalInterestTrend: calculateTrend('totalInterest'),
            flexibilityTrend: calculateTrend('flexibility'),
        };
        const recommendations = [];
        if (currentScore.totalScore < averageScore) {
            recommendations.push('当前方案评分低于历史平均水平，建议调整');
        }
        if (trendAnalysis.monthlyBurdenTrend > 10) {
            recommendations.push('月供压力呈上升趋势，建议考虑延长期限或增加首付');
        }
        if (trendAnalysis.totalInterestTrend > 5) {
            recommendations.push('利息成本呈上升趋势，建议考虑提前还款策略');
        }
        if (trendAnalysis.flexibilityTrend < -10) {
            recommendations.push('还款灵活性下降，建议评估收入稳定性');
        }
        return {
            averageScore,
            trendAnalysis,
            recommendations,
        };
    }
}
exports.LoanPlanRecommender = LoanPlanRecommender;
LoanPlanRecommender.RISK_WEIGHTS = {
    low: {
        monthlyBurden: 0.4,
        totalInterest: 0.3,
        flexibility: 0.1,
        termMatch: 0.2,
        stabilityScore: 0.3,
        riskScore: 0.4,
    },
    medium: {
        monthlyBurden: 0.3,
        totalInterest: 0.3,
        flexibility: 0.2,
        termMatch: 0.2,
        stabilityScore: 0.2,
        riskScore: 0.3,
    },
    high: {
        monthlyBurden: 0.2,
        totalInterest: 0.3,
        flexibility: 0.3,
        termMatch: 0.2,
        stabilityScore: 0.1,
        riskScore: 0.2,
    },
};
