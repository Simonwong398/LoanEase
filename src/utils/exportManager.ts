import { ExportFormat, ExportTemplate, ExportHistory, ExportOptions } from '../types/export';
import { PaymentMethod } from './loanCalculations';
import { generatePDF, generateExcel, generateCSV } from './exporters';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ExportManager {
  private static instance: ExportManager;
  private readonly TEMPLATES_KEY = '@export_templates';
  private readonly HISTORY_KEY = '@export_history';
  private templates: Map<string, ExportTemplate> = new Map();
  private history: ExportHistory[] = [];

  private constructor() {
    this.loadTemplates();
    this.loadHistory();
  }

  static getInstance(): ExportManager {
    if (!ExportManager.instance) {
      ExportManager.instance = new ExportManager();
    }
    return ExportManager.instance;
  }

  private async loadTemplates() {
    try {
      const data = await AsyncStorage.getItem(this.TEMPLATES_KEY);
      if (data) {
        const templates = JSON.parse(data);
        this.templates = new Map(Object.entries(templates));
      }
    } catch (error) {
      console.error('Failed to load export templates:', error);
    }
  }

  private async loadHistory() {
    try {
      const data = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (data) {
        this.history = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  }

  private async saveTemplates() {
    try {
      const data = Object.fromEntries(this.templates);
      await AsyncStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save export templates:', error);
    }
  }

  private async saveHistory() {
    try {
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save export history:', error);
    }
  }

  async exportLoanData(
    loanData: PaymentMethod,
    options: ExportOptions
  ): Promise<string> {
    try {
      let filePath: string;
      
      switch (options.template.format) {
        case 'pdf':
          filePath = await generatePDF(loanData, options);
          break;
        case 'excel':
          filePath = await generateExcel(loanData, options);
          break;
        case 'csv':
          filePath = await generateCSV(loanData, options);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      const history: ExportHistory = {
        id: Date.now().toString(),
        templateId: options.template.id,
        format: options.template.format,
        timestamp: Date.now(),
        status: 'success',
        filePath,
        fileSize: await this.getFileSize(filePath),
      };

      this.history.unshift(history);
      await this.saveHistory();

      return filePath;
    } catch (error) {
      const history: ExportHistory = {
        id: Date.now().toString(),
        templateId: options.template.id,
        format: options.template.format,
        timestamp: Date.now(),
        status: 'failed',
        error: error.message,
      };

      this.history.unshift(history);
      await this.saveHistory();

      throw error;
    }
  }

  async createTemplate(template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = Date.now().toString();
    const newTemplate: ExportTemplate = {
      ...template,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.templates.set(id, newTemplate);
    await this.saveTemplates();
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<ExportTemplate>) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: Date.now(),
    };

    this.templates.set(id, updatedTemplate);
    await this.saveTemplates();
    return updatedTemplate;
  }

  async deleteTemplate(id: string) {
    const success = this.templates.delete(id);
    if (success) {
      await this.saveTemplates();
    }
    return success;
  }

  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  getHistory(limit?: number): ExportHistory[] {
    return limit ? this.history.slice(0, limit) : this.history;
  }

  async clearHistory() {
    this.history = [];
    await this.saveHistory();
  }

  private async getFileSize(filePath: string): Promise<number> {
    // 实现获取文件大小的逻辑
    return 0;
  }
}

export const exportManager = ExportManager.getInstance(); 