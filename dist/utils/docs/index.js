"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.documentationManager = exports.DocStatus = exports.DocType = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
// 文档类型定义
var DocType;
(function (DocType) {
    DocType["API"] = "api";
    DocType["GUIDE"] = "guide";
    DocType["EXAMPLE"] = "example";
    DocType["MAINTENANCE"] = "maintenance";
    DocType["CONTRIBUTION"] = "contribution";
})(DocType || (exports.DocType = DocType = {}));
// 文档状态
var DocStatus;
(function (DocStatus) {
    DocStatus["DRAFT"] = "draft";
    DocStatus["REVIEW"] = "review";
    DocStatus["PUBLISHED"] = "published";
    DocStatus["ARCHIVED"] = "archived";
})(DocStatus || (exports.DocStatus = DocStatus = {}));
class DocumentationManager {
    constructor() {
        this.docs = new Map();
        this.config = {
            outputPath: './docs',
            template: 'default',
            format: 'md',
            includeMetadata: true,
            includeTimestamp: true,
            includeVersion: true
        };
        this.initialize();
    }
    static getInstance() {
        if (!DocumentationManager.instance) {
            DocumentationManager.instance = new DocumentationManager();
        }
        return DocumentationManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadDocs();
                yield this.generateIndices();
                logger_1.logger.info('DocumentationManager', 'Initialized successfully');
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('DocumentationManager', 'Initialization failed', actualError);
            }
        });
    }
    // 添加或更新文档
    addDoc(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                // 验证文档
                this.validateDoc(doc);
                // 更新时间戳
                doc.updatedAt = Date.now();
                // 保存文档
                this.docs.set(doc.id, doc);
                // 生成文档文件
                yield this.generateDoc(doc);
                yield performance_1.performanceManager.recordMetric('documentation', 'add', performance.now() - startTime, {
                    docId: doc.id,
                    type: doc.type
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('DocumentationManager', 'Failed to add doc', actualError);
                throw actualError;
            }
        });
    }
    // 生成 API 文档
    generateApiDocs(apis) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const startTime = performance.now();
            try {
                for (const api of apis) {
                    const doc = {
                        id: `api_${api.method}_${api.path}`,
                        type: DocType.API,
                        title: `${api.method.toUpperCase()} ${api.path}`,
                        description: ((_a = api.metadata) === null || _a === void 0 ? void 0 : _a.description) || '',
                        author: ((_b = api.metadata) === null || _b === void 0 ? void 0 : _b.author) || 'System',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        version: ((_c = api.metadata) === null || _c === void 0 ? void 0 : _c.version) || '1.0.0',
                        status: DocStatus.PUBLISHED,
                        tags: ((_d = api.metadata) === null || _d === void 0 ? void 0 : _d.tags) || [],
                        endpoint: api.path,
                        method: api.method,
                        params: this.extractParams(api.handler),
                        responses: ((_e = api.metadata) === null || _e === void 0 ? void 0 : _e.responses) || []
                    };
                    yield this.addDoc(doc);
                }
                yield performance_1.performanceManager.recordMetric('documentation', 'generateApi', performance.now() - startTime, {
                    count: apis.length
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('DocumentationManager', 'Failed to generate API docs', actualError);
                throw actualError;
            }
        });
    }
    // 生成示例文档
    generateExamples(examples) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const startTime = performance.now();
            try {
                for (const example of examples) {
                    const doc = {
                        id: `example_${Date.now()}`,
                        type: DocType.EXAMPLE,
                        title: ((_a = example.metadata) === null || _a === void 0 ? void 0 : _a.title) || 'Code Example',
                        description: ((_b = example.metadata) === null || _b === void 0 ? void 0 : _b.description) || '',
                        author: ((_c = example.metadata) === null || _c === void 0 ? void 0 : _c.author) || 'System',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        version: ((_d = example.metadata) === null || _d === void 0 ? void 0 : _d.version) || '1.0.0',
                        status: DocStatus.PUBLISHED,
                        tags: ((_e = example.metadata) === null || _e === void 0 ? void 0 : _e.tags) || [],
                        code: example.code,
                        explanation: example.explanation,
                        runnable: (_f = example.metadata) === null || _f === void 0 ? void 0 : _f.runnable
                    };
                    yield this.addDoc(doc);
                }
                yield performance_1.performanceManager.recordMetric('documentation', 'generateExamples', performance.now() - startTime, {
                    count: examples.length
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('DocumentationManager', 'Failed to generate examples', actualError);
                throw actualError;
            }
        });
    }
    // 生成维护指南
    generateMaintenanceGuide(procedures) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const doc = {
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
                yield this.addDoc(doc);
                yield performance_1.performanceManager.recordMetric('documentation', 'generateMaintenance', performance.now() - startTime, {
                    proceduresCount: procedures.length
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('DocumentationManager', 'Failed to generate maintenance guide', actualError);
                throw actualError;
            }
        });
    }
    // 生成贡献指南
    generateContributionGuide(guide) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const doc = {
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
                yield this.addDoc(doc);
                yield performance_1.performanceManager.recordMetric('documentation', 'generateContribution', performance.now() - startTime, {
                    guidelinesCount: doc.guidelines.length
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('DocumentationManager', 'Failed to generate contribution guide', actualError);
                throw actualError;
            }
        });
    }
    validateDoc(doc) {
        if (!doc.id || !doc.type || !doc.title) {
            throw new Error('Invalid document: missing required fields');
        }
    }
    generateDoc(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.formatDoc(doc);
            const filePath = path.join(this.config.outputPath, `${doc.id}.${this.config.format}`);
            yield fs.writeFile(filePath, content, 'utf8');
        });
    }
    formatDoc(doc) {
        switch (this.config.format) {
            case 'md':
                return this.formatMarkdown(doc);
            case 'html':
                return this.formatHtml(doc);
            default:
                throw new Error(`Unsupported format: ${this.config.format}`);
        }
    }
    formatMarkdown(doc) {
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
                content += this.formatApiDocMarkdown(doc);
                break;
            case DocType.EXAMPLE:
                content += this.formatExampleDocMarkdown(doc);
                break;
            case DocType.MAINTENANCE:
                content += this.formatMaintenanceDocMarkdown(doc);
                break;
            case DocType.CONTRIBUTION:
                content += this.formatContributionDocMarkdown(doc);
                break;
        }
        return content;
    }
    formatHtml(doc) {
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
    formatDocContent(doc) {
        switch (doc.type) {
            case DocType.API:
                return this.formatApiDocMarkdown(doc);
            case DocType.EXAMPLE:
                return this.formatExampleDocMarkdown(doc);
            case DocType.MAINTENANCE:
                return this.formatMaintenanceDocMarkdown(doc);
            case DocType.CONTRIBUTION:
                return this.formatContributionDocMarkdown(doc);
            default:
                return '';
        }
    }
    formatApiDocMarkdown(doc) {
        var _a, _b, _c;
        const params = ((_a = doc.params) === null || _a === void 0 ? void 0 : _a.length) ? `
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
        const responses = ((_b = doc.responses) === null || _b === void 0 ? void 0 : _b.length) ? `
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
        const examples = ((_c = doc.examples) === null || _c === void 0 ? void 0 : _c.length) ? `
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
    formatExampleDocMarkdown(doc) {
        var _a;
        let content = '## Code Example\n\n';
        content += '```typescript\n';
        content += doc.code;
        content += '\n```\n\n';
        content += '### Explanation\n\n';
        content += doc.explanation;
        if ((_a = doc.dependencies) === null || _a === void 0 ? void 0 : _a.length) {
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
    formatMaintenanceDocMarkdown(doc) {
        var _a;
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
        if ((_a = doc.troubleshooting) === null || _a === void 0 ? void 0 : _a.length) {
            content += '## Troubleshooting\n\n';
            doc.troubleshooting.forEach(item => {
                content += `### Problem: ${item.problem}\n\n`;
                content += `Solution: ${item.solution}\n\n`;
            });
        }
        return content;
    }
    formatContributionDocMarkdown(doc) {
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
    extractParams(handler) {
        // 实现参数提取逻辑
        return [];
    }
    loadDocs() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现文档加载逻辑
        });
    }
    generateIndices() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现索引生成逻辑
        });
    }
}
DocumentationManager.instance = null;
exports.documentationManager = DocumentationManager.getInstance();
