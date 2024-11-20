// 支付方式枚举
export enum PaymentMethod {
  MONTHLY = 'monthly',
  BIWEEKLY = 'biweekly',
  WEEKLY = 'weekly'
}

// 贷款类型
export interface Loan {
  id: string;
  amount: number;
  term: number;
  interestRate: number;
  paymentMethod: PaymentMethod;
}

// 贷款分析结果
export interface LoanAnalysis {
  totalPayment: number;
  totalInterest: number;
  monthlyPayment: number;
  paymentSchedule: PaymentSchedule[];
}

// 还款计划
export interface PaymentSchedule {
  paymentNumber: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
} 