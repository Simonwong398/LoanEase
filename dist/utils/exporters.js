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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
exports.generateExcel = generateExcel;
exports.generateCSV = generateCSV;
const jspdf_1 = require("jspdf");
const XLSX = __importStar(require("xlsx"));
const react_native_1 = require("react-native");
const react_native_fs_1 = __importDefault(require("react-native-fs"));
// 获取导出目录路径
const getExportPath = () => {
    return react_native_1.Platform.select({
        ios: react_native_fs_1.default.DocumentDirectoryPath,
        android: react_native_fs_1.default.ExternalDirectoryPath,
        default: './exports'
    });
};
// PDF导出
function generatePDF(loanData, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = new jspdf_1.jsPDF();
        const { template } = options;
        // 添加水印
        if (options.watermark) {
            doc.setTextColor(200);
            doc.setFontSize(40);
            doc.text(options.watermark, 30, 100, { angle: 45 });
        }
        // 根据模板配置生成内容
        template.sections.forEach((section, index) => {
            if (!section.enabled)
                return;
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
        yield doc.save(filePath);
        return filePath;
    });
}
// Excel导出
function generateExcel(loanData, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const workbook = XLSX.utils.book_new();
        const { template } = options;
        // 根据模板配置生成工作表
        template.sections.forEach(section => {
            if (!section.enabled)
                return;
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
    });
}
// CSV导出
function generateCSV(loanData, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { template } = options;
        let csvContent = '';
        template.sections.forEach(section => {
            if (!section.enabled)
                return;
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
        yield react_native_fs_1.default.writeFile(filePath, csvContent, 'utf8');
        return filePath;
    });
}
// 辅助函数
function generateBasicInfo(doc, loanData) {
    doc.setFontSize(16);
    doc.text('贷款基本信息', 20, 20);
    doc.setFontSize(12);
    doc.text(`贷款金额: ¥${loanData.totalPayment - loanData.totalInterest}`, 20, 40);
    doc.text(`月供: ¥${loanData.monthlyPayment}`, 20, 50);
    doc.text(`总利息: ¥${loanData.totalInterest}`, 20, 60);
    doc.text(`总还款: ¥${loanData.totalPayment}`, 20, 70);
}
function generateSchedule(doc, loanData, options) {
    // ... 保持原有实现
}
function generateAnalysis(doc, loanData, options) {
    // ... 保持原有实现
}
function generateComparison(doc, loanData, options) {
    // ... 保持原有实现
}
function addBasicSheet(workbook, loanData) {
    // ... 保持原有实现
}
function addScheduleSheet(workbook, loanData, options) {
    // ... 保持原有实现
}
function addAnalysisSheet(workbook, loanData, options) {
    // ... 保持原有实现
}
function addComparisonSheet(workbook, loanData, options) {
    // ... 保持原有实现
}
function generateBasicSection(loanData) {
    return [
        '贷款基本信息',
        `贷款金额,${loanData.totalPayment - loanData.totalInterest}`,
        `月供,${loanData.monthlyPayment}`,
        `总利息,${loanData.totalInterest}`,
        `总还款,${loanData.totalPayment}`,
    ].join('\n');
}
function generateScheduleSection(loanData, options) {
    if ((options === null || options === void 0 ? void 0 : options.detailLevel) === 'detailed') {
        return [
            '期数,月供,本金,利息,剩余本金',
            ...loanData.schedule.map(item => [
                item.month,
                item.payment,
                item.principal,
                item.interest,
                item.remainingBalance,
            ].join(',')),
        ].join('\n');
    }
    else {
        return [
            '还款计划摘要',
            `还款期数,${loanData.schedule.length}`,
            `首期还款,${loanData.schedule[0].payment}`,
            `末期还款,${loanData.schedule[loanData.schedule.length - 1].payment}`,
        ].join('\n');
    }
}
function generateAnalysisSection(loanData, options) {
    return [
        '贷款分析',
        `月供收入比,${(loanData.monthlyPayment / 10000).toFixed(2)}%`,
        `利息收入比,${(loanData.totalInterest / (loanData.totalPayment - loanData.totalInterest) * 100).toFixed(2)}%`,
        `总成本收入比,${(loanData.totalPayment / 10000).toFixed(2)}%`,
    ].join('\n');
}
function generateComparisonSection(loanData, options) {
    return [
        '贷款对比',
        `等额本息月供,${loanData.monthlyPayment}`,
        `等额本金首月供,${loanData.schedule[0].payment}`,
        `等额本金末月供,${loanData.schedule[loanData.schedule.length - 1].payment}`,
        `等额本息总利息,${loanData.totalInterest}`,
    ].join('\n');
}
