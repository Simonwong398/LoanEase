export interface DocumentService {
  validateDocument(documentId: string): Promise<boolean>;
  getDocumentById(documentId: string): Promise<any>;
}

export class DefaultDocumentService implements DocumentService {
  async validateDocument(documentId: string): Promise<boolean> {
    // 实现文档验证逻辑
    return true;
  }

  async getDocumentById(documentId: string): Promise<any> {
    // 实现文档获取逻辑
    return null;
  }
} 