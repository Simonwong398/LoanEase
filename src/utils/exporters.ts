import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { PaymentMethod } from './loanCalculations';
import { ExportOptions } from '../types/export';
import { precise } from './mathUtils';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

// 获取导出目录路径
const getExportPath = () => {
  return Platform.select({
    ios: RNFS.DocumentDirectoryPath,
    android: RNFS.ExternalDirectoryPath,
    default: './exports'
  });
};

// PDF导出
export async function generatePDF(
  loanData: PaymentMethod,
  options: ExportOptions
): Promise<string> {
  const doc = new jsPDF();
  const { template } = options;

  // 添加水印
  if (options.watermark) {
    doc.setTextColor(200);
    doc.setFontSize(40);
    doc.text(options.watermark, 30, 100, { angle: 45 });
  }

  // 根据模板配置生成内容
  template.sections.forEach((section, index) => {
    if (!section.enabled) return;

    switch (section.type) {
      case 'basic':
        generateBasicInfo(doc, loanData);
        break;
      case 'schedule':
        generateSchedule(doc, loanData, section.options);
        break;
      case 'analysis':
        generateAnalysis(doc, loanData, section.options);
        break;
      case 'comparison':
        generateComparison(doc, loanData, section.options);
        break;
    }

    // 添加分页
    if (index < template.sections.length - 1) {
      doc.addPage();
    }
  });

  // 如果设置了密码，添加加密
  if (options.password) {
    doc.setEncryption(options.password);
  }

  // 保存文件
  const fileName = `loan_report_${Date.now()}.pdf`;
  const filePath = `${getExportPath()}/${fileName}`;
  await doc.save(filePath);

  return filePath;
}

// Excel导出
export async function generateExcel(
  loanData: PaymentMethod,
  options: ExportOptions
): Promise<string> {
  const workbook = XLSX.utils.book_new();
  const { template } = options;

  // 根据模板配置生成工作表
  template.sections.forEach(section => {
    if (!section.enabled) return;

    switch (section.type) {
      case 'basic':
        addBasicSheet(workbook, loanData);
        break;
      case 'schedule':
        addScheduleSheet(workbook, loanData, section.options);
        break;
      case 'analysis':
        addAnalysisSheet(workbook, loanData, section.options);
        break;
      case 'comparison':
        addComparisonSheet(workbook, loanData, section.options);
        break;
    }
  });

  // 保存文件
  const fileName = `loan_report_${Date.now()}.xlsx`;
  const filePath = `${getExportPath()}/${fileName}`;
  XLSX.writeFile(workbook, filePath);

  return filePath;
}

// CSV导出
export async function generateCSV(
  loanData: PaymentMethod,
  options: ExportOptions
): Promise<string> {
  const { template } = options;
  let csvContent = '';

  template.sections.forEach(section => {
    if (!section.enabled) return;

    switch (section.type) {
      case 'basic':
        csvContent += generateBasicSection(loanData);
        break;
      case 'schedule':
        csvContent += generateScheduleSection(loanData, section.options);
        break;
      case 'analysis':
        csvContent += generateAnalysisSection(loanData, section.options);
        break;
      case 'comparison':
        csvContent += generateComparisonSection(loanData, section.options);
        break;
    }
    csvContent += '\n\n';
  });

  const fileName = `loan_report_${Date.now()}.csv`;
  const filePath = `${getExportPath()}/${fileName}`;
  await RNFS.writeFile(filePath, csvContent, 'utf8');

  return filePath;
}

// 辅助函数
function generateBasicInfo(doc: jsPDF, loanData: PaymentMethod) {
  doc.setFontSize(16);
  doc.text('贷款基本信息', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`贷款金额: ¥${loanData.totalPayment - loanData.totalInterest}`, 20, 40);
  doc.text(`月供: ¥${loanData.monthlyPayment}`, 20, 50);
  doc.text(`总利息: ¥${loanData.totalInterest}`, 20, 60);
  doc.text(`总还款: ¥${loanData.totalPayment}`, 20, 70);
}

function generateSchedule(
  doc: jsPDF,
  loanData: PaymentMethod,
  options?: { detailLevel?: 'summary' | 'detailed' }
) {
  // ... 保持原有实现
}

function generateAnalysis(
  doc: jsPDF,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // ... 保持原有实现
}

function generateComparison(
  doc: jsPDF,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // ... 保持原有实现
}

function addBasicSheet(workbook: XLSX.WorkBook, loanData: PaymentMethod) {
  // ... 保持原有实现
}

function addScheduleSheet(
  workbook: XLSX.WorkBook,
  loanData: PaymentMethod,
  options?: { detailLevel?: 'summary' | 'detailed' }
) {
  // ... 保持原有实现
}

function addAnalysisSheet(
  workbook: XLSX.WorkBook,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // ... 保持原有实现
}

function addComparisonSheet(
  workbook: XLSX.WorkBook,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // ... 保持原有实现
}

function generateBasicSection(loanData: PaymentMethod): string {
  return [
    '贷款基本信息',
    `贷款金额,${loanData.totalPayment - loanData.totalInterest}`,
    `月供,${loanData.monthlyPayment}`,
    `总利息,${loanData.totalInterest}`,
    `总还款,${loanData.totalPayment}`,
  ].join('\n');
}

function generateScheduleSection(
  loanData: PaymentMethod,
  options?: { detailLevel?: 'summary' | 'detailed' }
): string {
  if (options?.detailLevel === 'detailed') {
    return [
      '期数,月供,本金,利息,剩余本金',
      ...loanData.schedule.map(item =>
        [
          item.month,
          item.payment,
          item.principal,
          item.interest,
          item.remainingBalance,
        ].join(',')
      ),
    ].join('\n');
  } else {
    return [
      '还款计划摘要',
      `还款期数,${loanData.schedule.length}`,
      `首期还款,${loanData.schedule[0].payment}`,
      `末期还款,${loanData.schedule[loanData.schedule.length - 1].payment}`,
    ].join('\n');
  }
}

function generateAnalysisSection(
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
): string {
  return [
    '贷款分析',
    `月供收入比,${(loanData.monthlyPayment / 10000).toFixed(2)}%`,
    `利息收入比,${(loanData.totalInterest / (loanData.totalPayment - loanData.totalInterest) * 100).toFixed(2)}%`,
    `总成本收入比,${(loanData.totalPayment / 10000).toFixed(2)}%`,
  ].join('\n');
}

function generateComparisonSection(
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
): string {
  return [
    '贷款对比',
    `等额本息月供,${loanData.monthlyPayment}`,
    `等额本金首月供,${loanData.schedule[0].payment}`,
    `等额本金末月供,${loanData.schedule[loanData.schedule.length - 1].payment}`,
    `等额本息总利息,${loanData.totalInterest}`,
  ].join('\n');
} 