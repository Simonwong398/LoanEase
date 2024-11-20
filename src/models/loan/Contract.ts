export enum ContractStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted'
}

export interface LoanContract {
  id: string;
  applicationId: string;
  userId: string;
  amount: number;
  term: number;
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  disbursementDate?: Date;
  firstPaymentDate?: Date;
  lastPaymentDate?: Date;
  status: ContractStatus;
  paymentSchedule: {
    dueDate: Date;
    principal: number;
    interest: number;
    totalAmount: number;
    status: 'pending' | 'paid' | 'overdue';
    paidAmount?: number;
    paidDate?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
} 