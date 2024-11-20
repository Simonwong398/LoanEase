import { Document, DocumentType } from '../models/business';
import { StorageService } from './storageService';
import { NotificationService } from './notificationService';

interface VerifierData {
  verifiedBy: string;
  isVerified: boolean;
  rejectionReason?: string;
}

export class DocumentService {
  private storageService: StorageService;
  private notificationService: NotificationService;
  private documents: Map<string, Document> = new Map();

  constructor(
    storageService?: StorageService,
    notificationService?: NotificationService
  ) {
    this.storageService = storageService || new StorageService();
    this.notificationService = notificationService || new NotificationService();
  }

  async uploadDocument(
    file: Buffer,
    metadata: {
      type: DocumentType;
      userId: string;
      applicationId: string;
    }
  ): Promise<Document> {
    try {
      const url = await this.storageService.uploadFile(file, {
        path: `documents/${metadata.userId}/${metadata.applicationId}`,
        type: metadata.type
      });

      const document: Document = {
        id: this.generateId(),
        type: metadata.type,
        url,
        status: 'pending'
      };

      await this.saveDocument(document);
      return document;
    } catch (error) {
      throw new Error(`Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyDocument(documentId: string, verifierData: VerifierData): Promise<Document> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      document.status = verifierData.isVerified ? 'verified' : 'rejected';
      document.verifiedAt = new Date();
      document.verifiedBy = verifierData.verifiedBy;
      document.rejectionReason = verifierData.rejectionReason;

      await this.saveDocument(document);
      return document;
    } catch (error) {
      throw new Error(`Document verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  private async saveDocument(document: Document): Promise<void> {
    this.documents.set(document.id, document);
  }
} 