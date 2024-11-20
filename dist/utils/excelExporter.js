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
exports.generateExcel = generateExcel;
const XLSX = __importStar(require("xlsx"));
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
        const filePath = `${__dirname}/exports/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        return filePath;
    });
}
function addBasicSheet(workbook, loanData) {
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
function addScheduleSheet(workbook, loanData, options) {
    if ((options === null || options === void 0 ? void 0 : options.detailLevel) === 'detailed') {
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
    }
    else {
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
function addAnalysisSheet(workbook, loanData, options) {
    // 实现分析工作表生成逻辑
}
function addComparisonSheet(workbook, loanData, options) {
    // 实现对比工作表生成逻辑
}
