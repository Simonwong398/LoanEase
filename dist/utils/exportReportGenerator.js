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
exports.exportReportGenerator = void 0;
const fileNameGenerator_1 = require("./fileNameGenerator");
const react_native_fs_1 = __importDefault(require("react-native-fs"));
class ExportReportGenerator {
    constructor() { }
    static getInstance() {
        if (!ExportReportGenerator.instance) {
            ExportReportGenerator.instance = new ExportReportGenerator();
        }
        return ExportReportGenerator.instance;
    }
    generateReport(loanData_1) {
        return __awaiter(this, arguments, void 0, function* (loanData, options = {}) {
            const reportContent = this.generateReportContent(loanData, options);
            const fileName = (0, fileNameGenerator_1.generateFileName)('report', '贷款分析报告');
            const filePath = `${react_native_fs_1.default.DocumentDirectoryPath}/exports/${fileName}`;
            try {
                yield react_native_fs_1.default.writeFile(filePath, reportContent, 'utf8');
                return filePath;
            }
            catch (error) {
                console.error('Failed to generate report:', error);
                throw error;
            }
        });
    }
    generateReportContent(loanData, options) {
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
    generateHeader() {
        return `
贷款分析报告
生成时间: ${new Date().toLocaleString()}
-----------------------------------\n\n`;
    }
    generateBasicInfo(loanData) {
        return `
基本信息
-----------------------------------
贷款金额: ¥${loanData.totalPayment - loanData.totalInterest}
月供: ¥${loanData.monthlyPayment}
总利息: ¥${loanData.totalInterest}
总还款: ¥${loanData.totalPayment}
还款期数: ${loanData.schedule.length}个月\n\n`;
    }
    generatePaymentSchedule(loanData) {
        let schedule = `
还款计划
-----------------------------------\n`;
        loanData.schedule.forEach((item, index) => {
            if (index % 12 === 0) { // 每年的第一期
                schedule += `\n第${Math.floor(index / 12) + 1}年\n`;
            }
            schedule += `第${item.month}期: 月供¥${item.payment.toFixed(2)} ` +
                `(本金¥${item.principal.toFixed(2)}, ` +
                `利息¥${item.interest.toFixed(2)})\n`;
        });
        return schedule;
    }
    generateAnalysis(loanData) {
        const totalAmount = loanData.totalPayment - loanData.totalInterest;
        const interestRatio = (loanData.totalInterest / totalAmount) * 100;
        return `
贷款分析
-----------------------------------
利息总额占比: ${interestRatio.toFixed(2)}%
首月还款占比: ${((loanData.monthlyPayment / totalAmount) * 100).toFixed(2)}%
平均月供: ¥${(loanData.totalPayment / loanData.schedule.length).toFixed(2)}\n\n`;
    }
    addWatermark(content, watermark) {
        const lines = content.split('\n');
        return lines.map(line => `${line} ${watermark}`).join('\n');
    }
}
exports.exportReportGenerator = ExportReportGenerator.getInstance();
