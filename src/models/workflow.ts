// 贷款申请流程状态
export enum LoanApplicationStatus {
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

// 贷款申请流程
export interface LoanWorkflow {
  id: string;
  applicationId: string;
  currentStatus: LoanApplicationStatus;
  history: WorkflowHistory[];
  assignedTo?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// 流程历史记录
export interface WorkflowHistory {
  status: LoanApplicationStatus;
  timestamp: Date;
  actor: string;
  comment?: string;
  metadata?: Record<string, unknown>;
}

// 工作流配置
export interface WorkflowConfig {
  autoAssignment: boolean;
  slaTimeouts: Record<LoanApplicationStatus, number>;
  requiredDocuments: Record<LoanApplicationStatus, string[]>;
  notificationTriggers: Record<LoanApplicationStatus, NotificationConfig>;
}

// 通知配置
export interface NotificationConfig {
  templates: string[];
  channels: string[];
  recipients: string[];
} 