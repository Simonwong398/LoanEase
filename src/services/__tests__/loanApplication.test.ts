import { LoanApplicationService } from '../loanApplicationService';
import { NotificationService } from '../notificationService';
import { RiskService } from '../riskService';
import { DocumentService } from '../documentService';
import { StorageService } from '../storageService';
import { 
  LoanApplication, 
  ApplicationStatus, 
  DocumentType 
} from '../../models/business';

describe('LoanApplicationService', () => {
  let loanApplicationService: LoanApplicationService;
  let notificationService: NotificationService;
  let riskService: RiskService;
  let documentService: DocumentService;
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    notificationService = new NotificationService();
    riskService = new RiskService();
    documentService = new DocumentService(storageService);
    loanApplicationService = new LoanApplicationService(
      notificationService,
      riskService,
      documentService
    );
  });

  describe('Loan Application Flow', () => {
    it('should create a new loan application', async () => {
      const application = await loanApplicationService.createApplication(
        'user123',
        'product456',
        10000,
        12,
        'Home renovation'
      );

      expect(application).toBeDefined();
      expect(application.status).toBe(ApplicationStatus.DRAFT);
    });

    it('should not submit application without required documents', async () => {
      const application = await loanApplicationService.createApplication(
        'user123',
        'product456',
        10000,
        12,
        'Home renovation'
      );

      await expect(
        loanApplicationService.submitApplication(application.id)
      ).rejects.toThrow('Required documents missing');
    });

    it('should process complete application flow successfully', async () => {
      // 创建申请
      const application = await loanApplicationService.createApplication(
        'user123',
        'product456',
        10000,
        12,
        'Home renovation'
      );

      // 上传文档
      const documents = await Promise.all([
        documentService.uploadDocument(Buffer.from('test'), {
          type: DocumentType.ID_PROOF,
          userId: 'user123',
          applicationId: application.id
        }),
        documentService.uploadDocument(Buffer.from('test'), {
          type: DocumentType.INCOME_PROOF,
          userId: 'user123',
          applicationId: application.id
        })
      ]);

      // 提交申请
      const submittedApp = await loanApplicationService.submitApplication(application.id);
      expect(submittedApp.status).toBe(ApplicationStatus.SUBMITTED);

      // 验证文档
      for (const doc of documents) {
        await documentService.verifyDocument(doc.id, {
          verifiedBy: 'verifier123',
          isVerified: true
        });
      }

      // 处理风险评估
      const assessedApp = await loanApplicationService.processRiskAssessment(
        application.id,
        {
          id: 'risk123',
          applicationId: application.id,
          creditScore: 750,
          riskLevel: 'low',
          factors: [],
          recommendedAmount: 10000,
          recommendedRate: 0.05,
          assessedBy: 'assessor123',
          assessedAt: new Date()
        }
      );

      expect(assessedApp.status).toBe(ApplicationStatus.UNDERWRITING);

      // 最终审批
      const finalApp = await loanApplicationService.makeDecision(
        application.id,
        true,
        {
          amount: 10000,
          rate: 0.05
        }
      );

      expect(finalApp.status).toBe(ApplicationStatus.APPROVED);
      expect(finalApp.approvedAmount).toBe(10000);
      expect(finalApp.approvedRate).toBe(0.05);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid amount', async () => {
      await expect(
        loanApplicationService.createApplication(
          'user123',
          'product456',
          -1000,
          12,
          'Invalid amount'
        )
      ).rejects.toThrow('Invalid loan amount');
    });

    it('should handle invalid term', async () => {
      await expect(
        loanApplicationService.createApplication(
          'user123',
          'product456',
          10000,
          0,
          'Invalid term'
        )
      ).rejects.toThrow('Invalid loan term');
    });
  });
}); 