import { PaymentMethod } from './loanCalculations';
import { precise } from './mathUtils';

export interface LoanAnalysis {
  basic: {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    interestRatio: number;
  };
  trends: {
    principalTrend: number[];
    interestTrend: number[];
    remainingBalanceTrend: number[];
  };
  metrics: {
    debtIncomeRatio: number;
    paymentToIncome: number;
    loanToValue: number;
    breakEvenPoint: number;
  };
  risks: {
    interestRateRisk: 'low' | 'medium' | 'high';
    affordabilityRisk: 'low' | 'medium' | 'high';
    termRisk: 'low' | 'medium' | 'high';
  };
  optimization: {
    recommendedTerm: number;
    recommendedPayment: number;
    potentialSavings: number;
    prepaymentBenefit: number;
  };
}

export const analyzeLoan = (
  loan: PaymentMethod,
  context: {
    monthlyIncome: number;
    propertyValue: number;
  }
): LoanAnalysis => {
  const principal = loan.totalPayment - loan.totalInterest;

  // 基础分析
  const basic = {
    monthlyPayment: loan.monthlyPayment,
    totalPayment: loan.totalPayment,
    totalInterest: loan.totalInterest,
    interestRatio: precise.divide(loan.totalInterest, principal),
  };

  // 趋势分析
  const trends = {
    principalTrend: loan.schedule.map(s => s.principal),
    interestTrend: loan.schedule.map(s => s.interest),
    remainingBalanceTrend: loan.schedule.map(s => s.remainingBalance),
  };

  // 指标分析
  const metrics = {
    debtIncomeRatio: precise.divide(loan.monthlyPayment, context.monthlyIncome),
    paymentToIncome: precise.divide(loan.monthlyPayment * 12, context.monthlyIncome * 12),
    loanToValue: precise.divide(principal, context.propertyValue),
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

// 辅助函数
function calculateBreakEvenPoint(loan: PaymentMethod): number {
  // 实现损益平衡点计算
  return 0;
}

function assessInterestRateRisk(loan: PaymentMethod): 'low' | 'medium' | 'high' {
  // 实现利率风险评估
  return 'medium';
}

function assessAffordabilityRisk(paymentToIncome: number): 'low' | 'medium' | 'high' {
  if (paymentToIncome <= 0.3) return 'low';
  if (paymentToIncome <= 0.5) return 'medium';
  return 'high';
}

function assessTermRisk(months: number): 'low' | 'medium' | 'high' {
  if (months <= 180) return 'low'; // 15年以下
  if (months <= 300) return 'medium'; // 25年以下
  return 'high';
}

function calculateOptimalTerm(
  loan: PaymentMethod,
  context: { monthlyIncome: number }
): number {
  // 实现最优贷款期限计算
  return 0;
}

function calculateOptimalPayment(
  loan: PaymentMethod,
  context: { monthlyIncome: number }
): number {
  // 实现最优月供计算
  return 0;
}

function calculatePotentialSavings(loan: PaymentMethod): number {
  // 实现潜在节省计算
  return 0;
}

function calculatePrepaymentBenefit(loan: PaymentMethod): number {
  // 实现提前还款收益计算
  return 0;
} 