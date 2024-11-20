import { ExportHistory } from '../types/export';
import { PaymentMethod } from './loanCalculations';
import { generateFileName } from './fileNameGenerator';
import RNFS from 'react-native-fs';

interface ReportOptions {
  includePaymentSchedule?: boolean;
  includeAnalysis?: boolean;
  includeComparison?: boolean;
  watermark?: string;
}

class ExportReportGenerator {
  private static instance: ExportReportGenerator;

  private constructor() {}

  static getInstance(): ExportReportGenerator {
    if (!ExportReportGenerator.instance) {
      ExportReportGenerator.instance = new ExportReportGenerator();
    }
    return ExportReportGenerator.instance;
  }

  async generateReport(
    loanData: PaymentMethod,
    options: ReportOptions = {}
  ): Promise<string> {
    const reportContent = this.generateReportContent(loanData, options);
    const fileName = generateFileName('report', '贷款分析报告');
    const filePath = `${RNFS.DocumentDirectoryPath}/exports/${fileName}`;

    try {
      await RNFS.writeFile(filePath, reportContent, 'utf8');
      return filePath;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  private generateReportContent(
    loanData: PaymentMethod,
    options: ReportOptions
  ): string {
    let content = '';

    // 添加报告头部
    content += this.generateHeader();

    // 添加基本信息
    content += this.generateBasicInfo(loanData);

    // 添加还款计划
    if (options.includePaymentSchedule) {
      content += this.generatePaymentSchedule(loanData);
    }

    // 添加分析内容
    if (options.includeAnalysis) {
      content += this.generateAnalysis(loanData);
    }

    // 添加水印
    if (options.watermark) {
      content = this.addWatermark(content, options.watermark);
    }

    return content;
  }

  private generateHeader(): string {
    return `
贷款分析报告
生成时间: ${new Date().toLocaleString()}
-----------------------------------\n\n`;
  }

  private generateBasicInfo(loanData: PaymentMethod): string {
    return `
基本信息
-----------------------------------
贷款金额: ¥${loanData.totalPayment - loanData.totalInterest}
月供: ¥${loanData.monthlyPayment}
总利息: ¥${loanData.totalInterest}
总还款: ¥${loanData.totalPayment}
还款期数: ${loanData.schedule.length}个月\n\n`;
  }

  private generatePaymentSchedule(loanData: PaymentMethod): string {
    let schedule = `
还款计划
-----------------------------------\n`;
    
    loanData.schedule.forEach((item, index) => {
      if (index % 12 === 0) { // 每年的第一期
        schedule += `\n第${Math.floor(index/12) + 1}年\n`;
      }
      schedule += `第${item.month}期: 月供¥${item.payment.toFixed(2)} ` +
                 `(本金¥${item.principal.toFixed(2)}, ` +
                 `利息¥${item.interest.toFixed(2)})\n`;
    });

    return schedule;
  }

  private generateAnalysis(loanData: PaymentMethod): string {
    const totalAmount = loanData.totalPayment - loanData.totalInterest;
    const interestRatio = (loanData.totalInterest / totalAmount) * 100;

    return `
贷款分析
-----------------------------------
利息总额占比: ${interestRatio.toFixed(2)}%
首月还款占比: ${((loanData.monthlyPayment / totalAmount) * 100).toFixed(2)}%
平均月供: ¥${(loanData.totalPayment / loanData.schedule.length).toFixed(2)}\n\n`;
  }

  private addWatermark(content: string, watermark: string): string {
    const lines = content.split('\n');
    return lines.map(line => `${line} ${watermark}`).join('\n');
  }
}

export const exportReportGenerator = ExportReportGenerator.getInstance(); 