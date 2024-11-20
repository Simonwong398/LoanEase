"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedLoanAnalysis = void 0;
const react_1 = __importDefault(require("react"));
const useResponsive_1 = require("../hooks/useResponsive");
const AdvancedLoanAnalysis = ({ loanAmount, interestRate, loanTerm, paymentMethod }) => {
    const { screenWidth, getResponsiveValue } = (0, useResponsive_1.useResponsive)();
    const chartWidth = getResponsiveValue({
        mobile: screenWidth - 40,
        tablet: 600,
        desktop: 800,
        default: 600
    });
    return (<div>
      <h2>Advanced Loan Analysis</h2>
      {/* 添加图表和分析内容 */}
    </div>);
};
exports.AdvancedLoanAnalysis = AdvancedLoanAnalysis;
