import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentService } from '../documentService';
import { StorageService } from '../storageService';
import { DocumentType } from '../../models/business';
import { NotificationService } from '../notificationService';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let storageService: StorageService;
  let notificationService: NotificationService;

  beforeEach(() => {
    storageService = new StorageService();
    notificationService = new NotificationService();
    documentService = new DocumentService(storageService, notificationService);
  });

  describe('Document Upload', () => {
    it('should upload document successfully', async () => {
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };

      const document = await documentService.uploadDocument(file, metadata);

      expect(document).toBeDefined();
      expect(document.type).toBe(DocumentType.ID_PROOF);
      expect(document.status).toBe('pending');
    });

    it('should handle large file upload', async () => {
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const metadata = {
        type: DocumentType.BANK_STATEMENT,
        userId: 'user_123',
        applicationId: 'app_123'
      };

      await expect(
        documentService.uploadDocument(largeFile, metadata)
      ).rejects.toThrow('File size exceeds maximum allowed size');
    });

    it('should validate file type', async () => {
      const file = Buffer.from('invalid content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };

      jest.spyOn(documentService as any, 'validateFileType').mockResolvedValue(false);

      await expect(
        documentService.uploadDocument(file, metadata)
      ).rejects.toThrow('Invalid file type');
    });
  });

  describe('Document Verification', () => {
    it('should verify document successfully', async () => {
      // First upload a document
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };
      const document = await documentService.uploadDocument(file, metadata);

      // Then verify it
      const verifiedDoc = await documentService.verifyDocument(document.id, {
        verifiedBy: 'verifier_123',
        isVerified: true
      });

      expect(verifiedDoc.status).toBe('verified');
      expect(verifiedDoc.verifiedBy).toBe('verifier_123');
      expect(verifiedDoc.verifiedAt).toBeDefined();
    });

    it('should reject document with reason', async () => {
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };
      const document = await documentService.uploadDocument(file, metadata);

      const rejectedDoc = await documentService.verifyDocument(document.id, {
        verifiedBy: 'verifier_123',
        isVerified: false,
        rejectionReason: 'Document is unclear'
      });

      expect(rejectedDoc.status).toBe('rejected');
      expect(rejectedDoc.rejectionReason).toBe('Document is unclear');
    });

    it('should handle non-existent document', async () => {
      await expect(
        documentService.verifyDocument('non_existent_id', {
          verifiedBy: 'verifier_123',
          isVerified: true
        })
      ).rejects.toThrow('Document not found');
    });
  });

  describe('Document Notifications', () => {
    it('should send notification on document upload', async () => {
      const sendNotificationSpy = jest.spyOn(notificationService, 'sendNotification');
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };

      await documentService.uploadDocument(file, metadata);

      expect(sendNotificationSpy).toHaveBeenCalledWith(
        metadata.userId,
        'document_uploaded',
        expect.objectContaining({
          documentType: metadata.type,
          applicationId: metadata.applicationId
        })
      );
    });

    it('should send notification on document verification', async () => {
      const sendNotificationSpy = jest.spyOn(notificationService, 'sendNotification');
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };
      const document = await documentService.uploadDocument(file, metadata);

      await documentService.verifyDocument(document.id, {
        verifiedBy: 'verifier_123',
        isVerified: true
      });

      expect(sendNotificationSpy).toHaveBeenCalledWith(
        metadata.userId,
        'document_verified',
        expect.objectContaining({
          documentId: document.id,
          documentType: document.type
        })
      );
    });
  });

  describe('Document Storage', () => {
    it('should store document in correct path', async () => {
      const uploadFileSpy = jest.spyOn(storageService, 'uploadFile');
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };

      await documentService.uploadDocument(file, metadata);

      expect(uploadFileSpy).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          path: `documents/${metadata.userId}/${metadata.applicationId}`
        })
      );
    });

    it('should handle storage errors', async () => {
      jest.spyOn(storageService, 'uploadFile').mockRejectedValue(new Error('Storage error'));
      const file = Buffer.from('test document content');
      const metadata = {
        type: DocumentType.ID_PROOF,
        userId: 'user_123',
        applicationId: 'app_123'
      };

      await expect(
        documentService.uploadDocument(file, metadata)
      ).rejects.toThrow('Document upload failed: Storage error');
    });
  });
}); 