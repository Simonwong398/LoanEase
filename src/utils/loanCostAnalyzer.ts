import { PaymentMethod } from './loanCalculations';
import { precise } from './mathUtils';

export interface CostAnalysis {
  // 基础成本分析
  totalCost: number;           // 总成本
  interestCost: number;        // 利息成本
  monthlyBurden: number;       // 月供负担
  interestRatio: number;       // 利息占比
  
  // 时间维度分析
  yearlyInterest: number[];    // 每年利息
  yearlyPrincipal: number[];   // 每年本金
  yearlyPayment: number[];     // 每年还款额
  
  // 利率敏感性分析
  rateSensitivity: {
    rate: number;
    totalCost: number;
    monthlyPayment: number;
  }[];
  
  // 还款方式对比
  methodComparison: {
    equalPayment: PaymentMethod;    // 等额本息
    equalPrincipal: PaymentMethod;  // 等额本金
    difference: {
      totalInterest: number;        // 总利息差异
      maxMonthlyPayment: number;    // 最高月供差异
      minMonthlyPayment: number;    // 最低月供差异
    };
  };
}

export const analyzeLoanCost = (
  principal: number,
  rate: number,
  term: number,
  equalPayment: PaymentMethod,
  equalPrincipal: PaymentMethod
): CostAnalysis => {
  // 基础成本分析
  const totalCost = equalPayment.totalPayment;
  const interestCost = equalPayment.totalInterest;
  const monthlyBurden = equalPayment.monthlyPayment;
  const interestRatio = precise.divide(interestCost, principal);

  // 时间维度分析
  const yearlyStats = analyzeYearlyStats(equalPayment.schedule);

  // 利率敏感性分析
  const rateSensitivity = analyzeRateSensitivity(principal, rate, term);

  // 还款方式对比
  const methodComparison = {
    equalPayment,
    equalPrincipal,
    difference: {
      totalInterest: precise.subtract(
        equalPayment.totalInterest,
        equalPrincipal.totalInterest
      ),
      maxMonthlyPayment: precise.subtract(
        equalPayment.monthlyPayment,
        equalPrincipal.schedule[0].payment
      ),
      minMonthlyPayment: precise.subtract(
        equalPayment.monthlyPayment,
        equalPrincipal.schedule[equalPrincipal.schedule.length - 1].payment
      ),
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

// 分析年度统计数据
const analyzeYearlyStats = (schedule: PaymentMethod['schedule']) => {
  const yearlyStats = {
    interest: [] as number[],
    principal: [] as number[],
    payment: [] as number[],
  };

  for (let year = 0; year < schedule.length / 12; year++) {
    const yearlyPayments = schedule.slice(year * 12, (year + 1) * 12);
    yearlyStats.interest.push(
      yearlyPayments.reduce((sum, item) => sum + item.interest, 0)
    );
    yearlyStats.principal.push(
      yearlyPayments.reduce((sum, item) => sum + item.principal, 0)
    );
    yearlyStats.payment.push(
      yearlyPayments.reduce((sum, item) => sum + item.payment, 0)
    );
  }

  return yearlyStats;
};

// 分析利率敏感性
const analyzeRateSensitivity = (
  principal: number,
  baseRate: number,
  term: number
) => {
  const variations = [-1, -0.5, 0, 0.5, 1]; // 利率变动百分点
  return variations.map(variation => {
    const newRate = baseRate + variation;
    const monthlyRate = newRate / 12 / 100;
    const months = term * 12;
    
    const monthlyPayment = precise.multiply(
      principal,
      precise.divide(
        precise.multiply(monthlyRate, Math.pow(1 + monthlyRate, months)),
        precise.subtract(Math.pow(1 + monthlyRate, months), 1)
      )
    );
    
    const totalCost = monthlyPayment * months;

    return {
      rate: newRate,
      totalCost,
      monthlyPayment,
    };
  });
}; 