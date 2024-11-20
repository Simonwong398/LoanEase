import { precise } from './mathUtils';
import { optimizedCalculation, batchCalculate } from './calculationOptimizer';

export interface PaymentMethod {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

// 添加 LoanParams 接口定义
export interface LoanParams {
  principal: number;  // 贷款本金
  rate: number;      // 年利率
  term: number;      // 贷款期限（年）
}

// 为了兼容性，将 PaymentScheduleItem 也导出为 AmortizationScheduleItem
export type AmortizationScheduleItem = PaymentScheduleItem;

// 等额本息计算
export const calculateEqualPayment = (
  principal: number,
  annualRate: number,
  years: number
): PaymentMethod => {
  // 验证输入
  if (principal <= 0) throw new Error('Principal must be positive');
  if (annualRate < 0) throw new Error('Rate cannot be negative');
  if (years <= 0) throw new Error('Term must be positive');

  const monthlyRate = precise.divide(precise.divide(annualRate, 12), 100);
  const months = years * 12;
  
  // 计算月供
  const monthlyPayment = precise.multiply(
    principal,
    precise.divide(
      precise.multiply(monthlyRate, Math.pow(1 + monthlyRate, months)),
      precise.subtract(Math.pow(1 + monthlyRate, months), 1)
    )
  );

  const schedule: PaymentScheduleItem[] = [];
  let remainingBalance = principal;
  let totalPayment = 0;

  for (let month = 1; month <= months; month++) {
    const interest = precise.multiply(remainingBalance, monthlyRate);
    const principalPayment = precise.subtract(monthlyPayment, interest);
    remainingBalance = precise.subtract(remainingBalance, principalPayment);
    totalPayment = precise.add(totalPayment, monthlyPayment);

    schedule.push({
      month,
      payment: precise.round(monthlyPayment),
      principal: precise.round(principalPayment),
      interest: precise.round(interest),
      remainingBalance: precise.round(Math.max(0, remainingBalance)),
    });
  }

  return {
    monthlyPayment: precise.round(monthlyPayment),
    totalPayment: precise.round(totalPayment),
    totalInterest: precise.round(precise.subtract(totalPayment, principal)),
    schedule,
  };
};

// 等额本金计算
export const calculateEqualPrincipal = (
  principal: number,
  annualRate: number,
  years: number
): PaymentMethod => {
  // 验证输入
  if (principal <= 0) throw new Error('Principal must be positive');
  if (annualRate < 0) throw new Error('Rate cannot be negative');
  if (years <= 0) throw new Error('Term must be positive');

  const monthlyRate = precise.divide(precise.divide(annualRate, 12), 100);
  const months = years * 12;
  const monthlyPrincipal = precise.divide(principal, months);
  
  const schedule: PaymentScheduleItem[] = [];
  let remainingBalance = principal;
  let totalPayment = 0;

  for (let month = 1; month <= months; month++) {
    const interest = precise.multiply(remainingBalance, monthlyRate);
    const payment = precise.add(monthlyPrincipal, interest);
    remainingBalance = precise.subtract(remainingBalance, monthlyPrincipal);
    totalPayment = precise.add(totalPayment, payment);

    schedule.push({
      month,
      payment: precise.round(payment),
      principal: precise.round(monthlyPrincipal),
      interest: precise.round(interest),
      remainingBalance: precise.round(Math.max(0, remainingBalance)),
    });
  }

  return {
    monthlyPayment: precise.round(schedule[0].payment),
    totalPayment: precise.round(totalPayment),
    totalInterest: precise.round(precise.subtract(totalPayment, principal)),
    schedule,
  };
};

// 添加通用的分期计算函数
export const generateAmortizationSchedule = (
  principal: number,
  annualRate: number,
  years: number
): AmortizationScheduleItem[] => {
  return calculateEqualPayment(principal, annualRate, years).schedule;
};

export interface PrepaymentOption {
  month: number;        // 第几个月提前还款
  amount: number;       // 提前还款金额
  method: 'reduce_term' | 'reduce_payment';  // 减少期限/减少月供
}

// 计算提前还款后的还款计划
export const calculateWithPrepayment = (
  principal: number,
  annualRate: number,
  years: number,
  prepayment: PrepaymentOption
): PaymentMethod => {
  // 验证输入
  if (prepayment.amount >= principal) {
    throw new Error('Prepayment amount cannot exceed principal');
  }
  if (prepayment.month >= years * 12) {
    throw new Error('Prepayment month cannot exceed loan term');
  }

  const monthlyRate = precise.divide(precise.divide(annualRate, 12), 100);
  const totalMonths = years * 12;
  const schedule: PaymentScheduleItem[] = [];
  let remainingBalance = principal;
  let totalPayment = 0;

  // 计算原始月供
  const originalMonthlyPayment = precise.multiply(
    principal,
    precise.divide(
      precise.multiply(monthlyRate, Math.pow(1 + monthlyRate, totalMonths)),
      precise.subtract(Math.pow(1 + monthlyRate, totalMonths), 1)
    )
  );

  // 计算提前还款前的还款计划
  for (let month = 1; month <= prepayment.month; month++) {
    const interest = precise.multiply(remainingBalance, monthlyRate);
    const principalPayment = precise.subtract(originalMonthlyPayment, interest);
    remainingBalance = precise.subtract(remainingBalance, principalPayment);
    totalPayment = precise.add(totalPayment, originalMonthlyPayment);

    schedule.push({
      month,
      payment: precise.round(originalMonthlyPayment),
      principal: precise.round(principalPayment),
      interest: precise.round(interest),
      remainingBalance: precise.round(remainingBalance),
    });
  }

  // 处理提前还款
  remainingBalance = precise.subtract(remainingBalance, prepayment.amount);
  totalPayment = precise.add(totalPayment, prepayment.amount);

  if (prepayment.method === 'reduce_term') {
    // 减少期限，月供不变
    const newMonths = Math.ceil(
      Math.log(originalMonthlyPayment / (originalMonthlyPayment - remainingBalance * monthlyRate)) /
      Math.log(1 + monthlyRate)
    );

    for (let month = prepayment.month + 1; month <= newMonths; month++) {
      const interest = remainingBalance * monthlyRate;
      const principalPayment = originalMonthlyPayment - interest;
      remainingBalance -= principalPayment;
      totalPayment += originalMonthlyPayment;

      schedule.push({
        month,
        payment: originalMonthlyPayment,
        principal: principalPayment,
        interest,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
  } else {
    // 减少月供，期限不变
    const newMonthlyPayment = 
      (remainingBalance * monthlyRate * Math.pow(1 + monthlyRate, totalMonths - prepayment.month)) /
      (Math.pow(1 + monthlyRate, totalMonths - prepayment.month) - 1);

    for (let month = prepayment.month + 1; month <= totalMonths; month++) {
      const interest = remainingBalance * monthlyRate;
      const principalPayment = newMonthlyPayment - interest;
      remainingBalance -= principalPayment;
      totalPayment += newMonthlyPayment;

      schedule.push({
        month,
        payment: newMonthlyPayment,
        principal: principalPayment,
        interest,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
  }

  return {
    monthlyPayment: precise.round(schedule[0].payment),
    totalPayment: precise.round(totalPayment),
    totalInterest: precise.round(precise.subtract(totalPayment, principal)),
    schedule,
  };
};

// 计算组合贷款
export const calculateCombinedLoan = (
  commercial: {
    amount: number;
    rate: number;
  },
  providentFund: {
    amount: number;
    rate: number;
  },
  years: number
): {
  commercial: PaymentMethod;
  providentFund: PaymentMethod;
  combined: {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  };
} => {
  const commercialResult = calculateEqualPayment(
    commercial.amount,
    commercial.rate,
    years
  );

  const providentFundResult = calculateEqualPayment(
    providentFund.amount,
    providentFund.rate,
    years
  );

  return {
    commercial: commercialResult,
    providentFund: providentFundResult,
    combined: {
      monthlyPayment: commercialResult.monthlyPayment + providentFundResult.monthlyPayment,
      totalPayment: commercialResult.totalPayment + providentFundResult.totalPayment,
      totalInterest: commercialResult.totalInterest + providentFundResult.totalInterest,
    },
  };
};

// 优化贷款计算
export const calculateLoan = async (params: LoanParams): Promise<PaymentMethod> => {
  return optimizedCalculation(
    'calculateLoan',
    params,
    () => {
      // 原有的计算逻辑
      return calculateEqualPayment(
        params.principal,
        params.rate,
        params.term
      );
    },
    {
      useCache: true,
      priority: 'speed',
      timeout: 3000,
    }
  );
};

// 批量计算还款计划
export const calculatePaymentSchedules = async (
  loans: LoanParams[]
): Promise<PaymentMethod[]> => {
  return batchCalculate(
    loans,
    (loan) => calculateLoan(loan),
    5 // 每批处理5个贷款
  );
}; 