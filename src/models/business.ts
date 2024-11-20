// 贷款产品类型
export enum LoanProductType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage',
  EDUCATION = 'education'
}

// 贷款产品
export interface LoanProduct {
  id: string;
  type: LoanProductType;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  termMonths: number[];
  requirements: string[];
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 贷款申请状态
export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  DOCUMENT_VERIFICATION = 'document_verification',
  CREDIT_CHECK = 'credit_check',
  RISK_ASSESSMENT = 'risk_assessment',
  UNDERWRITING = 'underwriting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

// 贷款申请
export interface LoanApplication {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  termMonths: number;
  purpose: string;
  status: ApplicationStatus;
  documents: Document[];
  creditScore?: number;
  riskAssessment?: RiskAssessment;
  approvedAmount?: number;
  approvedRate?: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

// 文档类型
export enum DocumentType {
  ID_PROOF = 'id_proof',
  ADDRESS_PROOF = 'address_proof',
  INCOME_PROOF = 'income_proof',
  BANK_STATEMENT = 'bank_statement',
  EMPLOYMENT_PROOF = 'employment_proof'
}

// 文档
export interface Document {
  id: string;
  type: DocumentType;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

// 风险评估
export interface RiskAssessment {
  id: string;
  applicationId: string;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  recommendedAmount: number;
  recommendedRate: number;
  assessedBy: string;
  assessedAt: Date;
}

// 风险因素
export interface RiskFactor {
  type: string;
  description: string;
  impact: number;
  weight: number;
} 