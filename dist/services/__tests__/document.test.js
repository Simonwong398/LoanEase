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
const globals_1 = require("@jest/globals");
const documentService_1 = require("../documentService");
const storageService_1 = require("../storageService");
const business_1 = require("../../models/business");
const notificationService_1 = require("../notificationService");
(0, globals_1.describe)('DocumentService', () => {
    let documentService;
    let storageService;
    let notificationService;
    (0, globals_1.beforeEach)(() => {
        storageService = new storageService_1.StorageService();
        notificationService = new notificationService_1.NotificationService();
        documentService = new documentService_1.DocumentService(storageService, notificationService);
    });
    (0, globals_1.describe)('Document Upload', () => {
        (0, globals_1.it)('should upload document successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            const document = yield documentService.uploadDocument(file, metadata);
            (0, globals_1.expect)(document).toBeDefined();
            (0, globals_1.expect)(document.type).toBe(business_1.DocumentType.ID_PROOF);
            (0, globals_1.expect)(document.status).toBe('pending');
        }));
        (0, globals_1.it)('should handle large file upload', () => __awaiter(void 0, void 0, void 0, function* () {
            const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
            const metadata = {
                type: business_1.DocumentType.BANK_STATEMENT,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            yield (0, globals_1.expect)(documentService.uploadDocument(largeFile, metadata)).rejects.toThrow('File size exceeds maximum allowed size');
        }));
        (0, globals_1.it)('should validate file type', () => __awaiter(void 0, void 0, void 0, function* () {
            const file = Buffer.from('invalid content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            globals_1.jest.spyOn(documentService, 'validateFileType').mockResolvedValue(false);
            yield (0, globals_1.expect)(documentService.uploadDocument(file, metadata)).rejects.toThrow('Invalid file type');
        }));
    });
    (0, globals_1.describe)('Document Verification', () => {
        (0, globals_1.it)('should verify document successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // First upload a document
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            const document = yield documentService.uploadDocument(file, metadata);
            // Then verify it
            const verifiedDoc = yield documentService.verifyDocument(document.id, {
                verifiedBy: 'verifier_123',
                isVerified: true
            });
            (0, globals_1.expect)(verifiedDoc.status).toBe('verified');
            (0, globals_1.expect)(verifiedDoc.verifiedBy).toBe('verifier_123');
            (0, globals_1.expect)(verifiedDoc.verifiedAt).toBeDefined();
        }));
        (0, globals_1.it)('should reject document with reason', () => __awaiter(void 0, void 0, void 0, function* () {
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            const document = yield documentService.uploadDocument(file, metadata);
            const rejectedDoc = yield documentService.verifyDocument(document.id, {
                verifiedBy: 'verifier_123',
                isVerified: false,
                rejectionReason: 'Document is unclear'
            });
            (0, globals_1.expect)(rejectedDoc.status).toBe('rejected');
            (0, globals_1.expect)(rejectedDoc.rejectionReason).toBe('Document is unclear');
        }));
        (0, globals_1.it)('should handle non-existent document', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, globals_1.expect)(documentService.verifyDocument('non_existent_id', {
                verifiedBy: 'verifier_123',
                isVerified: true
            })).rejects.toThrow('Document not found');
        }));
    });
    (0, globals_1.describe)('Document Notifications', () => {
        (0, globals_1.it)('should send notification on document upload', () => __awaiter(void 0, void 0, void 0, function* () {
            const sendNotificationSpy = globals_1.jest.spyOn(notificationService, 'sendNotification');
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            yield documentService.uploadDocument(file, metadata);
            (0, globals_1.expect)(sendNotificationSpy).toHaveBeenCalledWith(metadata.userId, 'document_uploaded', globals_1.expect.objectContaining({
                documentType: metadata.type,
                applicationId: metadata.applicationId
            }));
        }));
        (0, globals_1.it)('should send notification on document verification', () => __awaiter(void 0, void 0, void 0, function* () {
            const sendNotificationSpy = globals_1.jest.spyOn(notificationService, 'sendNotification');
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            const document = yield documentService.uploadDocument(file, metadata);
            yield documentService.verifyDocument(document.id, {
                verifiedBy: 'verifier_123',
                isVerified: true
            });
            (0, globals_1.expect)(sendNotificationSpy).toHaveBeenCalledWith(metadata.userId, 'document_verified', globals_1.expect.objectContaining({
                documentId: document.id,
                documentType: document.type
            }));
        }));
    });
    (0, globals_1.describe)('Document Storage', () => {
        (0, globals_1.it)('should store document in correct path', () => __awaiter(void 0, void 0, void 0, function* () {
            const uploadFileSpy = globals_1.jest.spyOn(storageService, 'uploadFile');
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            yield documentService.uploadDocument(file, metadata);
            (0, globals_1.expect)(uploadFileSpy).toHaveBeenCalledWith(file, globals_1.expect.objectContaining({
                path: `documents/${metadata.userId}/${metadata.applicationId}`
            }));
        }));
        (0, globals_1.it)('should handle storage errors', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(storageService, 'uploadFile').mockRejectedValue(new Error('Storage error'));
            const file = Buffer.from('test document content');
            const metadata = {
                type: business_1.DocumentType.ID_PROOF,
                userId: 'user_123',
                applicationId: 'app_123'
            };
            yield (0, globals_1.expect)(documentService.uploadDocument(file, metadata)).rejects.toThrow('Document upload failed: Storage error');
        }));
    });
});
