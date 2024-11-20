import { LoanApplication, ApplicationStatus } from '@models/loan/Application';
import { DatabaseService } from '@services/storage';
import type { NotificationService } from '../notification';
import type { DocumentService } from '../document';
import { logger } from '@utils/logger';

export class LoanApplicationService {
  constructor(
    private db: DatabaseService,
    private notificationService: NotificationService,
    private documentService: DocumentService
  ) {}

  async createApplication(application: Omit<LoanApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LoanApplication> {
    try {
      const newApplication: LoanApplication = {
        ...application,
        id: `app_${Date.now()}`,
        status: ApplicationStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.db.execute(
        'INSERT INTO loan_applications (id, user_id, product_id, amount, term, purpose, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newApplication.id, newApplication.userId, newApplication.productId, newApplication.amount, newApplication.term, newApplication.purpose, newApplication.status, newApplication.createdAt, newApplication.updatedAt]
      );

      logger.info('Created new loan application', 'LoanApplicationService', { applicationId: newApplication.id });
      return newApplication;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Unknown error'
      );
      logger.error('Failed to create loan application', 'LoanApplicationService', error);
      throw error;
    }
  }

  // 提交申请
  async submitApplication(applicationId: string): Promise<LoanApplication> {
    try {
      const application = await this.getApplicationById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      if (application.status !== ApplicationStatus.DRAFT) {
        throw new Error('Application can only be submitted from draft status');
      }

      // 验证必要文档
      await this.validateRequiredDocuments(application);

      // 更新状态
      application.status = ApplicationStatus.SUBMITTED;
      application.submittedAt = new Date();
      application.updatedAt = new Date();

      await this.updateApplication(application);

      // 发送通知
      await this.notificationService.sendNotification(
        application.userId,
        'loan_application_submitted',
        { applicationId: application.id }
      );

      return application;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Unknown error'
      );
      logger.error('Failed to submit application', 'LoanApplicationService', error);
      throw error;
    }
  }

  // 处理申请
  async processApplication(applicationId: string, action: 'approve' | 'reject', data: {
    approvedAmount?: number;
    approvedRate?: number;
    rejectionReason?: string;
  }): Promise<LoanApplication> {
    try {
      const application = await this.getApplicationById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      if (action === 'approve') {
        if (!data.approvedAmount || !data.approvedRate) {
          throw new Error('Approved amount and rate are required');
        }
        application.status = ApplicationStatus.APPROVED;
        application.approvedAmount = data.approvedAmount;
        application.approvedRate = data.approvedRate;
        application.approvedAt = new Date();
      } else {
        if (!data.rejectionReason) {
          throw new Error('Rejection reason is required');
        }
        application.status = ApplicationStatus.REJECTED;
        application.rejectionReason = data.rejectionReason;
        application.rejectedAt = new Date();
      }

      application.updatedAt = new Date();
      await this.updateApplication(application);

      // 发送通知
      await this.notificationService.sendNotification(
        application.userId,
        action === 'approve' ? 'loan_approved' : 'loan_rejected',
        { applicationId: application.id }
      );

      return application;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Unknown error'
      );
      logger.error('Failed to process application', 'LoanApplicationService', error);
      throw error;
    }
  }

  private async getApplicationById(id: string): Promise<LoanApplication | null> {
    const applications = await this.db.query<LoanApplication>(
      'SELECT * FROM loan_applications WHERE id = ?',
      [id]
    );
    return applications[0] || null;
  }

  private async updateApplication(application: LoanApplication): Promise<void> {
    await this.db.execute(
      'UPDATE loan_applications SET status = ?, updated_at = ? WHERE id = ?',
      [application.status, application.updatedAt, application.id]
    );
  }

  private async validateRequiredDocuments(application: LoanApplication): Promise<void> {
    const requiredTypes = ['id_proof', 'income_proof', 'address_proof'];
    const missingTypes = requiredTypes.filter(type =>
      !application.documents.some(doc => doc.type === type && doc.status === 'verified')
    );

    if (missingTypes.length > 0) {
      throw new Error(`Missing required documents: ${missingTypes.join(', ')}`);
    }
  }
} 