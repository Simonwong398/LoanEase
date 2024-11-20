// 通知类型
export enum NotificationType {
  WORKFLOW_UPDATE = 'workflow_update',
  WORKFLOW_ASSIGNED = 'workflow_assigned',
  WORKFLOW_COMPLETED = 'workflow_completed',
  LOAN_APPLICATION_CREATED = 'loan_application_created',
  LOAN_APPLICATION_SUBMITTED = 'loan_application_submitted',
  LOAN_APPROVED = 'loan_approved',
  LOAN_REJECTED = 'loan_rejected',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_REJECTED = 'document_rejected',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_RECEIVED = 'payment_received',
  RISK_ASSESSMENT_COMPLETED = 'risk_assessment_completed'
}

// 通知优先级
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 通知渠道
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app'
}

// 通知状态
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// 通知记录
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

// 通知模板
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  defaultPriority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  variables: string[];
} 