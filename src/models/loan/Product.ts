export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage',
  EDUCATION = 'education'
}

export interface LoanProduct {
  id: string;
  type: LoanType;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  interestRate: number;
  processingFee: number;
  requirements: string[];
  features: string[];
  eligibilityCriteria: {
    minCreditScore: number;
    minIncome: number;
    minEmploymentYears: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 