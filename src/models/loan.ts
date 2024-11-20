// 贷款状态
export enum LoanStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  REPAYING = 'repaying',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted'
}

// 贷款类型
export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EDUCATION = 'education',
  MORTGAGE = 'mortgage'
}

// 贷款申请
export interface LoanApplication {
  id: string;
  applicantId: string;
  type: LoanType;
  amount: number;
  term: number; // 期限(月)
  purpose: string;
  status: LoanStatus;
  submittedAt: Date;
  documents: Document[];
  creditScore?: number;
  monthlyIncome: number;
  employmentInfo: EmploymentInfo;
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string[];
}

// 就业信息
export interface EmploymentInfo {
  employer: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'self-employed';
  yearsEmployed: number;
  monthlyIncome: number;
  employerContact?: string;
}

// 文档
export interface Document {
  id: string;
  type: 'id_card' | 'income_proof' | 'bank_statement' | 'employment_letter';
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

// 还款计划
export interface RepaymentSchedule {
  loanId: string;
  installments: Installment[];
  totalAmount: number;
  remainingAmount: number;
  nextPaymentDate: Date;
  interestRate: number;
}

// 分期付款
export interface Installment {
  id: string;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  lateFee?: number;
}

// 贷款产品
export interface LoanProduct {
  id: string;
  name: string;
  type: LoanType;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseInterestRate: number;
  requirements: string[];
  features: string[];
  processingFee: number;
  earlyRepaymentFee?: number;
  lateFee: number;
} 