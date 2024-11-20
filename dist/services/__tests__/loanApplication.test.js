"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const loanApplicationService_1 = require("../loanApplicationService");
const notificationService_1 = require("../notificationService");
const riskService_1 = require("../riskService");
const documentService_1 = require("../documentService");
const storageService_1 = require("../storageService");
const business_1 = require("../../models/business");
describe('LoanApplicationService', () => {
    let loanApplicationService;
    let notificationService;
    let riskService;
    let documentService;
    let storageService;
    beforeEach(() => {
        storageService = new storageService_1.StorageService();
        notificationService = new notificationService_1.NotificationService();
        riskService = new riskService_1.RiskService();
        documentService = new documentService_1.DocumentService(storageService);
        loanApplicationService = new loanApplicationService_1.LoanApplicationService(notificationService, riskService, documentService);
    });
    describe('Loan Application Flow', () => {
        it('should create a new loan application', () => __awaiter(void 0, void 0, void 0, function* () {
            const application = yield loanApplicationService.createApplication('user123', 'product456', 10000, 12, 'Home renovation');
            expect(application).toBeDefined();
            expect(application.status).toBe(business_1.ApplicationStatus.DRAFT);
        }));
        it('should not submit application without required documents', () => __awaiter(void 0, void 0, void 0, function* () {
            const application = yield loanApplicationService.createApplication('user123', 'product456', 10000, 12, 'Home renovation');
            yield expect(loanApplicationService.submitApplication(application.id)).rejects.toThrow('Required documents missing');
        }));
        it('should process complete application flow successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // 创建申请
            const application = yield loanApplicationService.createApplication('user123', 'product456', 10000, 12, 'Home renovation');
            // 上传文档
            const documents = yield Promise.all([
                documentService.uploadDocument(Buffer.from('test'), {
                    type: business_1.DocumentType.ID_PROOF,
                    userId: 'user123',
                    applicationId: application.id
                }),
                documentService.uploadDocument(Buffer.from('test'), {
                    type: business_1.DocumentType.INCOME_PROOF,
                    userId: 'user123',
                    applicationId: application.id
                })
            ]);
            // 提交申请
            const submittedApp = yield loanApplicationService.submitApplication(application.id);
            expect(submittedApp.status).toBe(business_1.ApplicationStatus.SUBMITTED);
            // 验证文档
            for (const doc of documents) {
                yield documentService.verifyDocument(doc.id, {
                    verifiedBy: 'verifier123',
                    isVerified: true
                });
            }
            // 处理风险评估
            const assessedApp = yield loanApplicationService.processRiskAssessment(application.id, {
                id: 'risk123',
                applicationId: application.id,
                creditScore: 750,
                riskLevel: 'low',
                factors: [],
                recommendedAmount: 10000,
                recommendedRate: 0.05,
                assessedBy: 'assessor123',
                assessedAt: new Date()
            });
            expect(assessedApp.status).toBe(business_1.ApplicationStatus.UNDERWRITING);
            // 最终审批
            const finalApp = yield loanApplicationService.makeDecision(application.id, true, {
                amount: 10000,
                rate: 0.05
            });
            expect(finalApp.status).toBe(business_1.ApplicationStatus.APPROVED);
            expect(finalApp.approvedAmount).toBe(10000);
            expect(finalApp.approvedRate).toBe(0.05);
        }));
    });
    describe('Error Handling', () => {
        it('should handle invalid amount', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(loanApplicationService.createApplication('user123', 'product456', -1000, 12, 'Invalid amount')).rejects.toThrow('Invalid loan amount');
        }));
        it('should handle invalid term', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(loanApplicationService.createApplication('user123', 'product456', 10000, 0, 'Invalid term')).rejects.toThrow('Invalid loan term');
        }));
    });
});
