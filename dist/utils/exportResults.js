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
exports.exportLoanResults = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const jspdf_1 = require("jspdf");
require("jspdf-autotable");
// 格式化函数
const formatCurrency = (value) => {
    return value.toLocaleString('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
    });
};
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};
// 导出函数
const exportToCSV = (summary, onProgress) => __awaiter(void 0, void 0, void 0, function* () {
    onProgress === null || onProgress === void 0 ? void 0 : onProgress(0);
    let csvContent = '\ufeff'; // 添加 BOM 以支持中文
    // ... CSV 导出逻辑 ...
    onProgress === null || onProgress === void 0 ? void 0 : onProgress(100);
});
const exportToExcel = (summary, onProgress) => __awaiter(void 0, void 0, void 0, function* () {
    onProgress === null || onProgress === void 0 ? void 0 : onProgress(0);
    const workbook = xlsx_1.default.utils.book_new();
    // ... Excel 导出逻辑 ...
    onProgress === null || onProgress === void 0 ? void 0 : onProgress(100);
});
const exportToPDF = (summary, onProgress) => __awaiter(void 0, void 0, void 0, function* () {
    onProgress === null || onProgress === void 0 ? void 0 : onProgress(0);
    const doc = new jspdf_1.jsPDF();
    // ... PDF 导出逻辑 ...
    onProgress === null || onProgress === void 0 ? void 0 : onProgress(100);
});
// 主导出函数
const exportLoanResults = (summary, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { format, onProgress } = options;
    try {
        switch (format) {
            case 'csv':
                yield exportToCSV(summary, onProgress);
                break;
            case 'excel':
                yield exportToExcel(summary, onProgress);
                break;
            case 'pdf':
                yield exportToPDF(summary, onProgress);
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
});
exports.exportLoanResults = exportLoanResults;
