import { PaymentMethod } from './loanCalculations';
import { ExportOptions } from '../types/export';
import * as fs from 'fs';

export async function generateCSV(
  loanData: PaymentMethod,
  options: ExportOptions
): Promise<string> {
  const { template } = options;
  let csvContent = '';

  // 根据模板配置生成内容
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

  // 保存文件
  const fileName = `loan_report_${Date.now()}.csv`;
  const filePath = `${__dirname}/exports/${fileName}`;
  await fs.promises.writeFile(filePath, csvContent);

  return filePath;
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
  // 实现分析部分生成逻辑
  return '';
}

function generateComparisonSection(
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
): string {
  // 实现对比部分生成逻辑
  return '';
} 