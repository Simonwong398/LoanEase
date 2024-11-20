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
const Application_1 = require("@models/loan/Application");
const logger_1 = require("@utils/logger");
class LoanApplicationService {
    constructor(db, notificationService, documentService) {
        this.db = db;
        this.notificationService = notificationService;
        this.documentService = documentService;
    }
    createApplication(application) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newApplication = Object.assign(Object.assign({}, application), { id: `app_${Date.now()}`, status: Application_1.ApplicationStatus.DRAFT, createdAt: new Date(), updatedAt: new Date() });
                yield this.db.execute('INSERT INTO loan_applications (id, user_id, product_id, amount, term, purpose, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [newApplication.id, newApplication.userId, newApplication.productId, newApplication.amount, newApplication.term, newApplication.purpose, newApplication.status, newApplication.createdAt, newApplication.updatedAt]);
                logger_1.logger.info('Created new loan application', 'LoanApplicationService', { applicationId: newApplication.id });
                return newApplication;
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
                logger_1.logger.error('Failed to create loan application', 'LoanApplicationService', error);
                throw error;
            }
        });
    }
    // 提交申请
    submitApplication(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.getApplicationById(applicationId);
                if (!application) {
                    throw new Error('Application not found');
                }
                if (application.status !== Application_1.ApplicationStatus.DRAFT) {
                    throw new Error('Application can only be submitted from draft status');
                }
                // 验证必要文档
                yield this.validateRequiredDocuments(application);
                // 更新状态
                application.status = Application_1.ApplicationStatus.SUBMITTED;
                application.submittedAt = new Date();
                application.updatedAt = new Date();
                yield this.updateApplication(application);
                // 发送通知
                yield this.notificationService.sendNotification(application.userId, 'loan_application_submitted', { applicationId: application.id });
                return application;
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
                logger_1.logger.error('Failed to submit application', 'LoanApplicationService', error);
                throw error;
            }
        });
    }
    // 处理申请
    processApplication(applicationId, action, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.getApplicationById(applicationId);
                if (!application) {
                    throw new Error('Application not found');
                }
                if (action === 'approve') {
                    if (!data.approvedAmount || !data.approvedRate) {
                        throw new Error('Approved amount and rate are required');
                    }
                    application.status = Application_1.ApplicationStatus.APPROVED;
                    application.approvedAmount = data.approvedAmount;
                    application.approvedRate = data.approvedRate;
                    application.approvedAt = new Date();
                }
                else {
                    if (!data.rejectionReason) {
                        throw new Error('Rejection reason is required');
                    }
                    application.status = Application_1.ApplicationStatus.REJECTED;
                    application.rejectionReason = data.rejectionReason;
                    application.rejectedAt = new Date();
                }
                application.updatedAt = new Date();
                yield this.updateApplication(application);
                // 发送通知
                yield this.notificationService.sendNotification(application.userId, action === 'approve' ? 'loan_approved' : 'loan_rejected', { applicationId: application.id });
                return application;
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
                logger_1.logger.error('Failed to process application', 'LoanApplicationService', error);
                throw error;
            }
        });
    }
    getApplicationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const applications = yield this.db.query('SELECT * FROM loan_applications WHERE id = ?', [id]);
            return applications[0] || null;
        });
    }
    updateApplication(application) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.execute('UPDATE loan_applications SET status = ?, updated_at = ? WHERE id = ?', [application.status, application.updatedAt, application.id]);
        });
    }
    validateRequiredDocuments(application) {
        return __awaiter(this, void 0, void 0, function* () {
            const requiredTypes = ['id_proof', 'income_proof', 'address_proof'];
            const missingTypes = requiredTypes.filter(type => !application.documents.some(doc => doc.type === type && doc.status === 'verified'));
            if (missingTypes.length > 0) {
                throw new Error(`Missing required documents: ${missingTypes.join(', ')}`);
            }
        });
    }
}
exports.LoanApplicationService = LoanApplicationService;
