import * as XLSX from 'xlsx';
import { PaymentMethod } from './loanCalculations';
import { ExportOptions } from '../types/export';

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
  const filePath = `${__dirname}/exports/${fileName}`;
  XLSX.writeFile(workbook, filePath);

  return filePath;
}

function addBasicSheet(workbook: XLSX.WorkBook, loanData: PaymentMethod) {
  const data = [
    ['贷款基本信息'],
    ['贷款金额', loanData.totalPayment - loanData.totalInterest],
    ['月供', loanData.monthlyPayment],
    ['总利息', loanData.totalInterest],
    ['总还款', loanData.totalPayment],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, ws, '基本信息');
}

function addScheduleSheet(
  workbook: XLSX.WorkBook,
  loanData: PaymentMethod,
  options?: { detailLevel?: 'summary' | 'detailed' }
) {
  if (options?.detailLevel === 'detailed') {
    const data = [
      ['期数', '月供', '本金', '利息', '剩余本金'],
      ...loanData.schedule.map(item => [
        item.month,
        item.payment,
        item.principal,
        item.interest,
        item.remainingBalance,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, ws, '还款计划');
  } else {
    const data = [
      ['还款计划摘要'],
      ['还款期数', loanData.schedule.length],
      ['首期还款', loanData.schedule[0].payment],
      ['末期还款', loanData.schedule[loanData.schedule.length - 1].payment],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, ws, '还款计划摘要');
  }
}

function addAnalysisSheet(
  workbook: XLSX.WorkBook,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // 实现分析工作表生成逻辑
}

function addComparisonSheet(
  workbook: XLSX.WorkBook,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // 实现对比工作表生成逻辑
} 