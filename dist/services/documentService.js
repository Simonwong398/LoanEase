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
exports.DocumentService = void 0;
const storageService_1 = require("./storageService");
const notificationService_1 = require("./notificationService");
class DocumentService {
    constructor(storageService, notificationService) {
        this.documents = new Map();
        this.storageService = storageService || new storageService_1.StorageService();
        this.notificationService = notificationService || new notificationService_1.NotificationService();
    }
    uploadDocument(file, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = yield this.storageService.uploadFile(file, {
                    path: `documents/${metadata.userId}/${metadata.applicationId}`,
                    type: metadata.type
                });
                const document = {
                    id: this.generateId(),
                    type: metadata.type,
                    url,
                    status: 'pending'
                };
                yield this.saveDocument(document);
                return document;
            }
            catch (error) {
                throw new Error(`Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    verifyDocument(documentId, verifierData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const document = yield this.getDocument(documentId);
                if (!document) {
                    throw new Error('Document not found');
                }
                document.status = verifierData.isVerified ? 'verified' : 'rejected';
                document.verifiedAt = new Date();
                document.verifiedBy = verifierData.verifiedBy;
                document.rejectionReason = verifierData.rejectionReason;
                yield this.saveDocument(document);
                return document;
            }
            catch (error) {
                throw new Error(`Document verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    generateId() {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.documents.get(id) || null;
        });
    }
    saveDocument(document) {
        return __awaiter(this, void 0, void 0, function* () {
            this.documents.set(document.id, document);
        });
    }
}
exports.DocumentService = DocumentService;
