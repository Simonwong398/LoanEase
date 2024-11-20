import { PaymentMethod } from './loanCalculations';
import { precise } from './mathUtils';

export interface LoanAnalysisResult {
  monthlyIncomeRatio: number;      // 月收入占比
  totalCostRatio: number;          // 总成本比例
  interestSavingsPotential: number; // 潜在利息节省
  paymentFlexibility: number;      // 还款灵活度
  riskLevel: number;               // 风险水平
  breakEvenPoint: number;          // 收支平衡点
  opportunityCost: number;         // 机会成本
  inflationImpact: number;         // 通货膨胀影响
}

export const analyzeLoan = (
  method: PaymentMethod,
  monthlyIncome: number,
  inflationRate: number = 0.03, // 默认通胀率3%
  investmentReturn: number = 0.06 // 默认投资回报率6%
): LoanAnalysisResult => {
  // 月收入占比（月供/月收入）
  const monthlyIncomeRatio = precise.divide(
    method.monthlyPayment,
    monthlyIncome
  );

  // 总成本比例（总利息/本金）
  const totalCostRatio = precise.divide(
    method.totalInterest,
    method.totalPayment - method.totalInterest
  );

  // 潜在利息节省（如果提前还款）
  const interestSavingsPotential = calculatePotentialSavings(method);

  // 还款灵活度（基于期限和月供）
  const paymentFlexibility = calculateFlexibility(method);

  // 风险水平（基于各种因素的综合评分）
  const riskLevel = calculateRiskLevel(method, monthlyIncomeRatio);

  // 收支平衡点（月）
  const breakEvenPoint = calculateBreakEvenPoint(method);

  // 机会成本（如果资金用于投资）
  const opportunityCost = calculateOpportunityCost(
    method,
    investmentReturn
  );

  // 通货膨胀影响
  const inflationImpact = calculateInflationImpact(
    method,
    inflationRate
  );

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

// 计算潜在利息节省
const calculatePotentialSavings = (method: PaymentMethod): number => {
  const halfTerm = Math.floor(method.schedule.length / 2);
  const remainingInterest = method.schedule
    .slice(halfTerm)
    .reduce((sum, item) => sum + item.interest, 0);
  return precise.divide(remainingInterest, method.totalInterest);
};

// 计算还款灵活度
const calculateFlexibility = (method: PaymentMethod): number => {
  const termFlexibility = precise.divide(method.schedule.length, 360); // 最长30年
  const paymentFlexibility = precise.divide(
    method.monthlyPayment,
    method.schedule[0].payment
  );
  return precise.multiply(
    precise.add(termFlexibility, paymentFlexibility),
    0.5
  );
};

// 计算风险水平
const calculateRiskLevel = (
  method: PaymentMethod,
  monthlyIncomeRatio: number
): number => {
  const incomeRiskFactor = monthlyIncomeRatio > 0.5 ? 0.4 : 0.2;
  const termRiskFactor = method.schedule.length > 240 ? 0.3 : 0.1;
  const interestRiskFactor = precise.divide(
    method.totalInterest,
    method.totalPayment
  ) > 0.4 ? 0.3 : 0.1;

  return precise.add(
    precise.add(incomeRiskFactor, termRiskFactor),
    interestRiskFactor
  );
};

// 计算收支平衡点
const calculateBreakEvenPoint = (method: PaymentMethod): number => {
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
const calculateOpportunityCost = (
  method: PaymentMethod,
  investmentReturn: number
): number => {
  const monthlyRate = precise.divide(investmentReturn, 12);
  let opportunityCost = 0;

  for (let i = 0; i < method.schedule.length; i++) {
    const payment = method.schedule[i].payment;
    const futureValue = payment * Math.pow(1 + monthlyRate, method.schedule.length - i);
    opportunityCost += futureValue;
  }

  return precise.subtract(opportunityCost, method.totalPayment);
};

// 计算通货膨胀影响
const calculateInflationImpact = (
  method: PaymentMethod,
  inflationRate: number
): number => {
  const monthlyInflation = precise.divide(inflationRate, 12);
  let realCost = 0;

  for (let i = 0; i < method.schedule.length; i++) {
    const payment = method.schedule[i].payment;
    const presentValue = payment / Math.pow(1 + monthlyInflation, i);
    realCost += presentValue;
  }

  return precise.subtract(method.totalPayment, realCost);
}; 