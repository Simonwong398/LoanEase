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
exports.LoanApplicationService = void 0;
const business_1 = require("../models/business");
const notification_1 = require("../models/notification");
class LoanApplicationService {
    constructor(notificationService, riskService, documentService) {
        this.notificationService = notificationService;
        this.riskService = riskService;
        this.documentService = documentService;
    }
    // 创建贷款申请
    createApplication(userId, productId, amount, termMonths, purpose) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 验证申请数据
                yield this.validateApplicationData(productId, amount, termMonths);
                // 创建申请
                const application = {
                    id: this.generateId(),
                    userId,
                    productId,
                    amount,
                    termMonths,
                    purpose,
                    status: business_1.ApplicationStatus.DRAFT,
                    documents: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                // 保存申请
                yield this.saveApplication(application);
                // 发送通知
                yield this.notificationService.sendNotification(userId, notification_1.NotificationType.LOAN_APPLICATION_CREATED, { applicationId: application.id });
                return application;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to create application: ${error.message}`);
                }
                throw new Error('Failed to create application: Unknown error');
            }
        });
    }
    // 提交申请
    submitApplication(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.getApplication(applicationId);
                if (!application) {
                    throw new Error('Application not found');
                }
                // 验证所需文档
                yield this.validateRequiredDocuments(application);
                // 更新状态
                application.status = business_1.ApplicationStatus.SUBMITTED;
                application.submittedAt = new Date();
                application.updatedAt = new Date();
                // 保存更新
                yield this.saveApplication(application);
                // 启动文档验证流程
                yield this.startDocumentVerification(application);
                // 发送通知
                yield this.notificationService.sendNotification(application.userId, notification_1.NotificationType.LOAN_APPLICATION_SUBMITTED, { applicationId: application.id });
                return application;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to submit application: ${error.message}`);
                }
                throw new Error('Failed to submit application: Unknown error');
            }
        });
    }
    // 处理文档验证
    processDocumentVerification(applicationId, documentId, isVerified, verifiedBy, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.getApplication(applicationId);
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
                    application.status = business_1.ApplicationStatus.CREDIT_CHECK;
                    yield this.startCreditCheck(application);
                }
                // 保存更新
                application.updatedAt = new Date();
                yield this.saveApplication(application);
                return application;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to process document verification: ${error.message}`);
                }
                throw new Error('Failed to process document verification: Unknown error');
            }
        });
    }
    // 处理风险评估
    processRiskAssessment(applicationId, assessment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.getApplication(applicationId);
                if (!application) {
                    throw new Error('Application not found');
                }
                // 更新风险评估结果
                application.riskAssessment = assessment;
                application.status = business_1.ApplicationStatus.UNDERWRITING;
                application.updatedAt = new Date();
                // 保存更新
                yield this.saveApplication(application);
                // 发送通知
                yield this.notificationService.sendNotification(application.userId, notification_1.NotificationType.RISK_ASSESSMENT_COMPLETED, { applicationId: application.id });
                return application;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to process risk assessment: ${error.message}`);
                }
                throw new Error('Failed to process risk assessment: Unknown error');
            }
        });
    }
    // 最终审批决定
    makeDecision(applicationId, isApproved, decision) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.getApplication(applicationId);
                if (!application) {
                    throw new Error('Application not found');
                }
                if (isApproved) {
                    application.status = business_1.ApplicationStatus.APPROVED;
                    application.approvedAmount = decision.amount;
                    application.approvedRate = decision.rate;
                    application.approvedAt = new Date();
                }
                else {
                    application.status = business_1.ApplicationStatus.REJECTED;
                    application.rejectionReason = decision.rejectionReason;
                    application.rejectedAt = new Date();
                }
                application.updatedAt = new Date();
                yield this.saveApplication(application);
                // 发送通知
                yield this.notificationService.sendNotification(application.userId, isApproved ? notification_1.NotificationType.LOAN_APPROVED : notification_1.NotificationType.LOAN_REJECTED, { applicationId: application.id });
                return application;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to make decision: ${error.message}`);
                }
                throw new Error('Failed to make decision: Unknown error');
            }
        });
    }
    // 私有辅助方法
    generateId() {
        return `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    validateApplicationData(productId, amount, termMonths) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现验证逻辑
        });
    }
    validateRequiredDocuments(application) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现文档验证逻辑
        });
    }
    startDocumentVerification(application) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现文档验证流程启动逻辑
        });
    }
    startCreditCheck(application) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现信用检查流程启动逻辑
        });
    }
    // 数据库操作方法
    saveApplication(application) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现保存逻辑
        });
    }
    getApplication(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取逻辑
            return null;
        });
    }
}
exports.LoanApplicationService = LoanApplicationService;
