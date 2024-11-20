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
exports.generateCSV = generateCSV;
const fs = __importStar(require("fs"));
function generateCSV(loanData, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { template } = options;
        let csvContent = '';
        // 根据模板配置生成内容
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
        // 保存文件
        const fileName = `loan_report_${Date.now()}.csv`;
        const filePath = `${__dirname}/exports/${fileName}`;
        yield fs.promises.writeFile(filePath, csvContent);
        return filePath;
    });
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
    // 实现分析部分生成逻辑
    return '';
}
function generateComparisonSection(loanData, options) {
    // 实现对比部分生成逻辑
    return '';
}
