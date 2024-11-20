import {
  LoanApplication,
  ApplicationStatus,
  Document,
  RiskAssessment
} from '../models/business';
import { NotificationService, RiskService, DocumentService } from './';
import { NotificationType } from '../models/notification';

export class LoanApplicationService {
  constructor(
    private notificationService: NotificationService,
    private riskService: RiskService,
    private documentService: DocumentService
  ) {}

  // 创建贷款申请
  async createApplication(
    userId: string,
    productId: string,
    amount: number,
    termMonths: number,
    purpose: string
  ): Promise<LoanApplication> {
    try {
      // 验证申请数据
      await this.validateApplicationData(productId, amount, termMonths);

      // 创建申请
      const application: LoanApplication = {
        id: this.generateId(),
        userId,
        productId,
        amount,
        termMonths,
        purpose,
        status: ApplicationStatus.DRAFT,
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 保存申请
      await this.saveApplication(application);

      // 发送通知
      await this.notificationService.sendNotification(
        userId,
        NotificationType.LOAN_APPLICATION_CREATED,
        { applicationId: application.id }
      );

      return application;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create application: ${error.message}`);
      }
      throw new Error('Failed to create application: Unknown error');
    }
  }

  // 提交申请
  async submitApplication(applicationId: string): Promise<LoanApplication> {
    try {
      const application = await this.getApplication(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // 验证所需文档
      await this.validateRequiredDocuments(application);

      // 更新状态
      application.status = ApplicationStatus.SUBMITTED;
      application.submittedAt = new Date();
      application.updatedAt = new Date();

      // 保存更新
      await this.saveApplication(application);

      // 启动文档验证流程
      await this.startDocumentVerification(application);

      // 发送通知
      await this.notificationService.sendNotification(
        application.userId,
        NotificationType.LOAN_APPLICATION_SUBMITTED,
        { applicationId: application.id }
      );

      return application;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit application: ${error.message}`);
      }
      throw new Error('Failed to submit application: Unknown error');
    }
  }

  // 处理文档验证
  async processDocumentVerification(
    applicationId: string,
    documentId: string,
    isVerified: boolean,
    verifiedBy: string,
    rejectionReason?: string
  ): Promise<LoanApplication> {
    try {
      const application = await this.getApplication(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // 更新文档状态
      const document = application.documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      document.status = isVerified ? 'verified' : 'rejected';
      document.verifiedAt = new Date();
      document.verifiedBy = verifiedBy;
      document.rejectionReason = rejectionReason;

      // 检查所有文档是否已验证
      const allVerified = application.documents.every(doc => doc.status === 'verified');
      if (allVerified) {
        // 进入信用检查阶段
        application.status = ApplicationStatus.CREDIT_CHECK;
        await this.startCreditCheck(application);
      }

      // 保存更新
      application.updatedAt = new Date();
      await this.saveApplication(application);

      return application;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to process document verification: ${error.message}`);
      }
      throw new Error('Failed to process document verification: Unknown error');
    }
  }

  // 处理风险评估
  async processRiskAssessment(
    applicationId: string,
    assessment: RiskAssessment
  ): Promise<LoanApplication> {
    try {
      const application = await this.getApplication(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // 更新风险评估结果
      application.riskAssessment = assessment;
      application.status = ApplicationStatus.UNDERWRITING;
      application.updatedAt = new Date();

      // 保存更新
      await this.saveApplication(application);

      // 发送通知
      await this.notificationService.sendNotification(
        application.userId,
        NotificationType.RISK_ASSESSMENT_COMPLETED,
        { applicationId: application.id }
      );

      return application;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to process risk assessment: ${error.message}`);
      }
      throw new Error('Failed to process risk assessment: Unknown error');
    }
  }

  // 最终审批决定
  async makeDecision(
    applicationId: string,
    isApproved: boolean,
    decision: {
      amount?: number;
      rate?: number;
      rejectionReason?: string;
    }
  ): Promise<LoanApplication> {
    try {
      const application = await this.getApplication(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      if (isApproved) {
        application.status = ApplicationStatus.APPROVED;
        application.approvedAmount = decision.amount;
        application.approvedRate = decision.rate;
        application.approvedAt = new Date();
      } else {
        application.status = ApplicationStatus.REJECTED;
        application.rejectionReason = decision.rejectionReason;
        application.rejectedAt = new Date();
      }

      application.updatedAt = new Date();
      await this.saveApplication(application);

      // 发送通知
      await this.notificationService.sendNotification(
        application.userId,
        isApproved ? NotificationType.LOAN_APPROVED : NotificationType.LOAN_REJECTED,
        { applicationId: application.id }
      );

      return application;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to make decision: ${error.message}`);
      }
      throw new Error('Failed to make decision: Unknown error');
    }
  }

  // 私有辅助方法
  private generateId(): string {
    return `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateApplicationData(
    productId: string,
    amount: number,
    termMonths: number
  ): Promise<void> {
    // 实现验证逻辑
  }

  private async validateRequiredDocuments(application: LoanApplication): Promise<void> {
    // 实现文档验证逻辑
  }

  private async startDocumentVerification(application: LoanApplication): Promise<void> {
    // 实现文档验证流程启动逻辑
  }

  private async startCreditCheck(application: LoanApplication): Promise<void> {
    // 实现信用检查流程启动逻辑
  }

  // 数据库操作方法
  private async saveApplication(application: LoanApplication): Promise<void> {
    // 实现保存逻辑
  }

  private async getApplication(id: string): Promise<LoanApplication | null> {
    // 实现获取逻辑
    return null;
  }
} 