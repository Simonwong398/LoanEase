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

export interface LoanApplication {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  term: number;
  purpose: string;
  status: ApplicationStatus;
  creditScore?: number;
  monthlyIncome: number;
  employmentInfo: {
    employer: string;
    position: string;
    yearsEmployed: number;
    employmentType: 'full-time' | 'part-time' | 'self-employed';
  };
  documents: {
    id: string;
    type: string;
    url: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
    verifiedBy?: string;
  }[];
  approvedAmount?: number;
  approvedRate?: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
} 