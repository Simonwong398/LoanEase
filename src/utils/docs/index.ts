import { logger } from '../logger';
import { performanceManager } from '../performance';
import * as fs from 'fs/promises';
import * as path from 'path';

// 文档类型定义
export enum DocType {
  API = 'api',
  GUIDE = 'guide',
  EXAMPLE = 'example',
  MAINTENANCE = 'maintenance',
  CONTRIBUTION = 'contribution'
}

// 文档状态
export enum DocStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 文档元数据
interface DocMetadata {
  id: string;
  type: DocType;
  title: string;
  description: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  status: DocStatus;
  tags: string[];
}

// API 文档接口
interface ApiDoc extends DocMetadata {
  type: DocType.API;
  endpoint?: string;
  method?: string;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses?: Array<{
    code: number;
    type: string;
    description: string;
  }>;
  examples?: Array<{
    request: string;
    response: string;
  }>;
}

// 示例文档接口
interface ExampleDoc extends DocMetadata {
  type: DocType.EXAMPLE;
  code: string;
  explanation: string;
  dependencies?: string[];
  runnable?: boolean;
  output?: string;
}

// 维护文档接口
interface MaintenanceDoc extends DocMetadata {
  type: DocType.MAINTENANCE;
  procedures: Array<{
    name: string;
    steps: string[];
    frequency: string;
    importance: 'low' | 'medium' | 'high';
  }>;
  troubleshooting?: Array<{
    problem: string;
    solution: string;
  }>;
}

// 贡献文档接口
interface ContributionDoc extends DocMetadata {
  type: DocType.CONTRIBUTION;
  guidelines: string[];
  codeStandards: string[];
  reviewProcess: string[];
  commitConventions: string[];
}

// 文档类型联合
type Doc = ApiDoc | ExampleDoc | MaintenanceDoc | ContributionDoc;

// 文档生成配置
interface DocGenConfig {
  outputPath: string;
  template: string;
  format: 'md' | 'html' | 'pdf';
  includeMetadata: boolean;
  includeTimestamp: boolean;
  includeVersion: boolean;
}

class DocumentationManager {
  private static instance: DocumentationManager | null = null;
  private docs = new Map<string, Doc>();
  private readonly config: DocGenConfig = {
    outputPath: './docs',
    template: 'default',
    format: 'md',
    includeMetadata: true,
    includeTimestamp: true,
    includeVersion: true
  };

  private constructor() {
    this.initialize();
  }

  static getInstance(): DocumentationManager {
    if (!DocumentationManager.instance) {
      DocumentationManager.instance = new DocumentationManager();
    }
    return DocumentationManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadDocs();
      await this.generateIndices();
      logger.info('DocumentationManager', 'Initialized successfully');
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('DocumentationManager', 'Initialization failed', actualError);
    }
  }

  // 添加或更新文档
  async addDoc(doc: Doc): Promise<void> {
    const startTime = performance.now();

    try {
      // 验证文档
      this.validateDoc(doc);

      // 更新时间戳
      doc.updatedAt = Date.now();

      // 保存文档
      this.docs.set(doc.id, doc);

      // 生成文档文件
      await this.generateDoc(doc);

      await performanceManager.recordMetric('documentation', 'add', performance.now() - startTime, {
        docId: doc.id,
        type: doc.type
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('DocumentationManager', 'Failed to add doc', actualError);
      throw actualError;
    }
  }

  // 生成 API 文档
  async generateApiDocs(
    apis: Array<{
      path: string;
      method: string;
      handler: Function;
      metadata?: Partial<ApiDoc>;
    }>
  ): Promise<void> {
    const startTime = performance.now();

    try {
      for (const api of apis) {
        const doc: ApiDoc = {
          id: `api_${api.method}_${api.path}`,
          type: DocType.API,
          title: `${api.method.toUpperCase()} ${api.path}`,
          description: api.metadata?.description || '',
          author: api.metadata?.author || 'System',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: api.metadata?.version || '1.0.0',
          status: DocStatus.PUBLISHED,
          tags: api.metadata?.tags || [],
          endpoint: api.path,
          method: api.method,
          params: this.extractParams(api.handler),
          responses: api.metadata?.responses || []
        };

        await this.addDoc(doc);
      }

      await performanceManager.recordMetric('documentation', 'generateApi', performance.now() - startTime, {
        count: apis.length
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('DocumentationManager', 'Failed to generate API docs', actualError);
      throw actualError;
    }
  }

  // 生成示例文档
  async generateExamples(
    examples: Array<{
      code: string;
      explanation: string;
      metadata?: Partial<ExampleDoc>;
    }>
  ): Promise<void> {
    const startTime = performance.now();

    try {
      for (const example of examples) {
        const doc: ExampleDoc = {
          id: `example_${Date.now()}`,
          type: DocType.EXAMPLE,
          title: example.metadata?.title || 'Code Example',
          description: example.metadata?.description || '',
          author: example.metadata?.author || 'System',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: example.metadata?.version || '1.0.0',
          status: DocStatus.PUBLISHED,
          tags: example.metadata?.tags || [],
          code: example.code,
          explanation: example.explanation,
          runnable: example.metadata?.runnable
        };

        await this.addDoc(doc);
      }

      await performanceManager.recordMetric('documentation', 'generateExamples', performance.now() - startTime, {
        count: examples.length
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('DocumentationManager', 'Failed to generate examples', actualError);
      throw actualError;
    }
  }

  // 生成维护指南
  async generateMaintenanceGuide(procedures: MaintenanceDoc['procedures']): Promise<void> {
    const startTime = performance.now();

    try {
      const doc: MaintenanceDoc = {
        id: 'maintenance_guide',
        type: DocType.MAINTENANCE,
        title: 'System Maintenance Guide',
        description: 'Comprehensive guide for system maintenance',
        author: 'System',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        status: DocStatus.PUBLISHED,
        tags: ['maintenance', 'guide', 'system'],
        procedures
      };

      await this.addDoc(doc);

      await performanceManager.recordMetric('documentation', 'generateMaintenance', performance.now() - startTime, {
        proceduresCount: procedures.length
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('DocumentationManager', 'Failed to generate maintenance guide', actualError);
      throw actualError;
    }
  }

  // 生成贡献指南
  async generateContributionGuide(guide: Partial<ContributionDoc>): Promise<void> {
    const startTime = performance.now();

    try {
      const doc: ContributionDoc = {
        id: 'contribution_guide',
        type: DocType.CONTRIBUTION,
        title: 'Contribution Guidelines',
        description: 'Guide for contributing to the project',
        author: 'System',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        status: DocStatus.PUBLISHED,
        tags: ['contribution', 'guide', 'development'],
        guidelines: guide.guidelines || [],
        codeStandards: guide.codeStandards || [],
        reviewProcess: guide.reviewProcess || [],
        commitConventions: guide.commitConventions || []
      };

      await this.addDoc(doc);

      await performanceManager.recordMetric('documentation', 'generateContribution', performance.now() - startTime, {
        guidelinesCount: doc.guidelines.length
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('DocumentationManager', 'Failed to generate contribution guide', actualError);
      throw actualError;
    }
  }

  private validateDoc(doc: Doc): void {
    if (!doc.id || !doc.type || !doc.title) {
      throw new Error('Invalid document: missing required fields');
    }
  }

  private async generateDoc(doc: Doc): Promise<void> {
    const content = this.formatDoc(doc);
    const filePath = path.join(this.config.outputPath, `${doc.id}.${this.config.format}`);
    await fs.writeFile(filePath, content, 'utf8');
  }

  private formatDoc(doc: Doc): string {
    switch (this.config.format) {
      case 'md':
        return this.formatMarkdown(doc);
      case 'html':
        return this.formatHtml(doc);
      default:
        throw new Error(`Unsupported format: ${this.config.format}`);
    }
  }

  private formatMarkdown(doc: Doc): string {
    let content = `# ${doc.title}\n\n`;
    content += `${doc.description}\n\n`;

    if (this.config.includeMetadata) {
      content += '## Metadata\n\n';
      content += `- Author: ${doc.author}\n`;
      content += `- Version: ${doc.version}\n`;
      content += `- Status: ${doc.status}\n`;
      content += `- Tags: ${doc.tags.join(', ')}\n\n`;
    }

    switch (doc.type) {
      case DocType.API:
        content += this.formatApiDocMarkdown(doc as ApiDoc);
        break;
      case DocType.EXAMPLE:
        content += this.formatExampleDocMarkdown(doc as ExampleDoc);
        break;
      case DocType.MAINTENANCE:
        content += this.formatMaintenanceDocMarkdown(doc as MaintenanceDoc);
        break;
      case DocType.CONTRIBUTION:
        content += this.formatContributionDocMarkdown(doc as ContributionDoc);
        break;
    }

    return content;
  }

  private formatHtml(doc: Doc): string {
    // 简单的 HTML 格式化
    const metadata = this.config.includeMetadata ? `
      <div class="metadata">
        <p>Author: ${doc.author}</p>
        <p>Version: ${doc.version}</p>
        <p>Status: ${doc.status}</p>
        <p>Tags: ${doc.tags.join(', ')}</p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <p>${doc.description}</p>
          ${metadata}
          ${this.formatDocContent(doc)}
        </body>
      </html>
    `;
  }

  private formatDocContent(doc: Doc): string {
    switch (doc.type) {
      case DocType.API:
        return this.formatApiDocMarkdown(doc as ApiDoc);
      case DocType.EXAMPLE:
        return this.formatExampleDocMarkdown(doc as ExampleDoc);
      case DocType.MAINTENANCE:
        return this.formatMaintenanceDocMarkdown(doc as MaintenanceDoc);
      case DocType.CONTRIBUTION:
        return this.formatContributionDocMarkdown(doc as ContributionDoc);
      default:
        return '';
    }
  }

  private formatApiDocMarkdown(doc: ApiDoc): string {
    const params = doc.params?.length ? `
      <h3>Parameters</h3>
      <table>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
        ${doc.params.map(param => `
          <tr>
            <td>${param.name}</td>
            <td>${param.type}</td>
            <td>${param.required}</td>
            <td>${param.description}</td>
          </tr>
        `).join('')}
      </table>
    ` : '';

    const responses = doc.responses?.length ? `
      <h3>Responses</h3>
      <table>
        <tr>
          <th>Code</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
        ${doc.responses.map(response => `
          <tr>
            <td>${response.code}</td>
            <td>${response.type}</td>
            <td>${response.description}</td>
          </tr>
        `).join('')}
      </table>
    ` : '';

    const examples = doc.examples?.length ? `
      <h3>Examples</h3>
      ${doc.examples.map((example, index) => `
        <h4>Example ${index + 1}</h4>
        <pre>
// Request
${example.request}

// Response
${example.response}
        </pre>
      `).join('')}
    ` : '';

    return `
      <h2>API Documentation</h2>
      <h3>Endpoint: ${doc.method} ${doc.endpoint}</h3>
      ${params}
      ${responses}
      ${examples}
    `;
  }

  private formatExampleDocMarkdown(doc: ExampleDoc): string {
    let content = '## Code Example\n\n';
    content += '```typescript\n';
    content += doc.code;
    content += '\n```\n\n';
    content += '### Explanation\n\n';
    content += doc.explanation;
    
    if (doc.dependencies?.length) {
      content += '\n\n### Dependencies\n\n';
      doc.dependencies.forEach(dep => {
        content += `- ${dep}\n`;
      });
    }

    if (doc.output) {
      content += '\n### Output\n\n';
      content += '```\n';
      content += doc.output;
      content += '\n```\n';
    }

    return content;
  }

  private formatMaintenanceDocMarkdown(doc: MaintenanceDoc): string {
    let content = '## Maintenance Procedures\n\n';
    
    doc.procedures.forEach(proc => {
      content += `### ${proc.name}\n\n`;
      content += `Importance: ${proc.importance}\n`;
      content += `Frequency: ${proc.frequency}\n\n`;
      content += '#### Steps\n\n';
      proc.steps.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`;
      });
      content += '\n';
    });

    if (doc.troubleshooting?.length) {
      content += '## Troubleshooting\n\n';
      doc.troubleshooting.forEach(item => {
        content += `### Problem: ${item.problem}\n\n`;
        content += `Solution: ${item.solution}\n\n`;
      });
    }

    return content;
  }

  private formatContributionDocMarkdown(doc: ContributionDoc): string {
    let content = '## Contribution Guidelines\n\n';

    content += '### Guidelines\n\n';
    doc.guidelines.forEach(guideline => {
      content += `- ${guideline}\n`;
    });

    content += '\n### Code Standards\n\n';
    doc.codeStandards.forEach(standard => {
      content += `- ${standard}\n`;
    });

    content += '\n### Review Process\n\n';
    doc.reviewProcess.forEach(step => {
      content += `- ${step}\n`;
    });

    content += '\n### Commit Conventions\n\n';
    doc.commitConventions.forEach(convention => {
      content += `- ${convention}\n`;
    });

    return content;
  }

  private extractParams(handler: Function): ApiDoc['params'] {
    // 实现参数提取逻辑
    return [];
  }

  private async loadDocs(): Promise<void> {
    // 实现文档加载逻辑
  }

  private async generateIndices(): Promise<void> {
    // 实现索引生成逻辑
  }
}

export const documentationManager = DocumentationManager.getInstance();
export type { ApiDoc, ExampleDoc, MaintenanceDoc, ContributionDoc }; 