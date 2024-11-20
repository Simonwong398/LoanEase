import { calculateEqualPayment, PaymentMethod } from './loanCalculations';
import { precise } from './mathUtils';

export interface SensitivityResult {
  value: number;
  monthlyPayment: number;
  totalInterest: number;
  percentageChange: number;
}

export interface SensitivityAnalysis {
  parameter: string;
  baselineValue: number;
  results: SensitivityResult[];
}

export const analyzeSensitivity = (
  principal: number,
  rate: number,
  term: number,
  parameters: {
    rate?: number[];
    term?: number[];
  }
): SensitivityAnalysis[] => {
  // 基准案例
  const baseline = calculateEqualPayment(principal, rate, term);
  const analyses: SensitivityAnalysis[] = [];

  // 利率敏感性分析
  if (parameters.rate) {
    const rateAnalysis: SensitivityAnalysis = {
      parameter: 'rate',
      baselineValue: rate,
      results: parameters.rate.map(newRate => {
        const result = calculateEqualPayment(principal, newRate, term);
        return {
          value: newRate,
          monthlyPayment: result.monthlyPayment,
          totalInterest: result.totalInterest,
          percentageChange: precise.multiply(
            precise.divide(
              precise.subtract(result.totalInterest, baseline.totalInterest),
              baseline.totalInterest
            ),
            100
          ),
        };
      }),
    };
    analyses.push(rateAnalysis);
  }

  // 期限敏感性分析
  if (parameters.term) {
    const termAnalysis: SensitivityAnalysis = {
      parameter: 'term',
      baselineValue: term,
      results: parameters.term.map(newTerm => {
        const result = calculateEqualPayment(principal, rate, newTerm);
        return {
          value: newTerm,
          monthlyPayment: result.monthlyPayment,
          totalInterest: result.totalInterest,
          percentageChange: precise.multiply(
            precise.divide(
              precise.subtract(result.totalInterest, baseline.totalInterest),
              baseline.totalInterest
            ),
            100
          ),
        };
      }),
    };
    analyses.push(termAnalysis);
  }

  return analyses;
};

// 计算财务指标
export interface FinancialMetrics {
  debtServiceRatio: number;          // 债务收入比
  loanToValue: number;               // 贷款价值比
  breakEvenPoint: number;            // 收支平衡点（月）
  effectiveInterestRate: number;     // 实际年化利率
  totalCostOfBorrowing: number;      // 借贷总本
  savingsFromPrepayment?: number;    // 提前还款节省
}

export const calculateFinancialMetrics = (
  loanDetails: {
    principal: number;
    monthlyPayment: number;
    totalInterest: number;
    term: number;
    propertyValue?: number;
    monthlyIncome?: number;
  },
  prepaymentSavings?: number
): FinancialMetrics => {
  const monthlyIncome = loanDetails.monthlyIncome || 0;
  const propertyValue = loanDetails.propertyValue || loanDetails.principal;

  // 债务收入比
  const debtServiceRatio = monthlyIncome > 0 ?
    precise.divide(loanDetails.monthlyPayment, monthlyIncome) : 0;

  // 贷款价值比
  const loanToValue = precise.divide(loanDetails.principal, propertyValue);

  // 收支平衡点（月）
  const monthlyInterest = precise.divide(loanDetails.totalInterest, loanDetails.term * 12);
  const breakEvenPoint = Math.ceil(
    precise.divide(loanDetails.principal, 
      precise.subtract(loanDetails.monthlyPayment, monthlyInterest))
  );

  // 实际年化利率
  const effectiveInterestRate = precise.multiply(
    precise.divide(loanDetails.totalInterest, 
      precise.multiply(loanDetails.principal, loanDetails.term)),
    100
  );

  // 借贷总成本
  const totalCostOfBorrowing = precise.add(
    loanDetails.totalInterest,
    precise.multiply(loanDetails.monthlyPayment, 0.001) // 假设每次还款手续费0.1%
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

// 优化方案推荐
export interface LoanRecommendation {
  score: number;
  recommendation: string;
  reasons: string[];
  risks: string[];
  suggestions: string[];
}

export const generateRecommendation = (
  metrics: FinancialMetrics,
  loanType: string
): LoanRecommendation => {
  let score = 100;
  const reasons: string[] = [];
  const risks: string[] = [];
  const suggestions: string[] = [];

  // 评估债务收入比
  if (metrics.debtServiceRatio > 0.5) {
    score -= 30;
    risks.push('debt_service_ratio_high');
    suggestions.push('consider_longer_term');
  } else if (metrics.debtServiceRatio > 0.4) {
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