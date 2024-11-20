export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportTemplate {
  id: string;
  name: string;
  format: ExportFormat;
  sections: ExportSection[];
  createdAt: number;
  updatedAt: number;
}

export interface ExportSection {
  id: string;
  type: 'basic' | 'schedule' | 'analysis' | 'comparison';
  enabled: boolean;
  options?: {
    includeCharts?: boolean;
    detailLevel?: 'summary' | 'detailed';
    dateRange?: [Date, Date];
  };
}

export interface ExportHistory {
  id: string;
  templateId: string;
  format: ExportFormat;
  timestamp: number;
  status: 'success' | 'failed';
  error?: string;
  filePath?: string;
  fileSize?: number;
}

export interface ExportOptions {
  template: ExportTemplate;
  watermark?: string;
  password?: string;
  compression?: boolean;
} 