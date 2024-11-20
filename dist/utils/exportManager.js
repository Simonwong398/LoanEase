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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportManager = void 0;
const exporters_1 = require("./exporters");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class ExportManager {
    constructor() {
        this.TEMPLATES_KEY = '@export_templates';
        this.HISTORY_KEY = '@export_history';
        this.templates = new Map();
        this.history = [];
        this.loadTemplates();
        this.loadHistory();
    }
    static getInstance() {
        if (!ExportManager.instance) {
            ExportManager.instance = new ExportManager();
        }
        return ExportManager.instance;
    }
    loadTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem(this.TEMPLATES_KEY);
                if (data) {
                    const templates = JSON.parse(data);
                    this.templates = new Map(Object.entries(templates));
                }
            }
            catch (error) {
                console.error('Failed to load export templates:', error);
            }
        });
    }
    loadHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem(this.HISTORY_KEY);
                if (data) {
                    this.history = JSON.parse(data);
                }
            }
            catch (error) {
                console.error('Failed to load export history:', error);
            }
        });
    }
    saveTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = Object.fromEntries(this.templates);
                yield async_storage_1.default.setItem(this.TEMPLATES_KEY, JSON.stringify(data));
            }
            catch (error) {
                console.error('Failed to save export templates:', error);
            }
        });
    }
    saveHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
            }
            catch (error) {
                console.error('Failed to save export history:', error);
            }
        });
    }
    exportLoanData(loanData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath;
                switch (options.template.format) {
                    case 'pdf':
                        filePath = yield (0, exporters_1.generatePDF)(loanData, options);
                        break;
                    case 'excel':
                        filePath = yield (0, exporters_1.generateExcel)(loanData, options);
                        break;
                    case 'csv':
                        filePath = yield (0, exporters_1.generateCSV)(loanData, options);
                        break;
                    default:
                        throw new Error('Unsupported export format');
                }
                const history = {
                    id: Date.now().toString(),
                    templateId: options.template.id,
                    format: options.template.format,
                    timestamp: Date.now(),
                    status: 'success',
                    filePath,
                    fileSize: yield this.getFileSize(filePath),
                };
                this.history.unshift(history);
                yield this.saveHistory();
                return filePath;
            }
            catch (error) {
                const history = {
                    id: Date.now().toString(),
                    templateId: options.template.id,
                    format: options.template.format,
                    timestamp: Date.now(),
                    status: 'failed',
                    error: error.message,
                };
                this.history.unshift(history);
                yield this.saveHistory();
                throw error;
            }
        });
    }
    createTemplate(template) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Date.now().toString();
            const newTemplate = Object.assign(Object.assign({}, template), { id, createdAt: Date.now(), updatedAt: Date.now() });
            this.templates.set(id, newTemplate);
            yield this.saveTemplates();
            return newTemplate;
        });
    }
    updateTemplate(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = this.templates.get(id);
            if (!template) {
                throw new Error('Template not found');
            }
            const updatedTemplate = Object.assign(Object.assign(Object.assign({}, template), updates), { updatedAt: Date.now() });
            this.templates.set(id, updatedTemplate);
            yield this.saveTemplates();
            return updatedTemplate;
        });
    }
    deleteTemplate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = this.templates.delete(id);
            if (success) {
                yield this.saveTemplates();
            }
            return success;
        });
    }
    getTemplates() {
        return Array.from(this.templates.values());
    }
    getHistory(limit) {
        return limit ? this.history.slice(0, limit) : this.history;
    }
    clearHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            this.history = [];
            yield this.saveHistory();
        });
    }
    getFileSize(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取文件大小的逻辑
            return 0;
        });
    }
}
exports.exportManager = ExportManager.getInstance();
