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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const loan_1 = require("../models/loan");
class LoanService {
    // 提交贷款申请
    submitApplication(application) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 验证申请数据
                this.validateApplication(application);
                // 创建申请记录
                const newApplication = Object.assign(Object.assign({}, application), { id: this.generateId(), status: loan_1.LoanStatus.PENDING, submittedAt: new Date() });
                // 保存到数据库
                yield this.saveLoanApplication(newApplication);
                // 开始自动审核流程
                this.startAutomaticReview(newApplication.id);
                return newApplication;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to submit loan application: ${error.message}`);
                }
                throw new Error('Failed to submit loan application: Unknown error');
            }
        });
    }
    // 计算还款计划
    calculateRepaymentSchedule(amount, term, interestRate) {
        const monthlyInterestRate = interestRate / 12 / 100;
        const monthlyPayment = this.calculateMonthlyPayment(amount, term, monthlyInterestRate);
        const installments = [];
        let remainingPrincipal = amount;
        let currentDate = new Date();
        for (let i = 0; i < term; i++) {
            const interest = remainingPrincipal * monthlyInterestRate;
            const principal = monthlyPayment - interest;
            remainingPrincipal -= principal;
            currentDate.setMonth(currentDate.getMonth() + 1);
            const installment = {
                id: this.generateId(),
                dueDate: new Date(currentDate),
                amount: monthlyPayment,
                principal,
                interest,
                status: 'pending'
            };
            installments.push(installment);
        }
        return {
            loanId: this.generateId(),
            installments,
            totalAmount: monthlyPayment * term,
            remainingAmount: amount,
            nextPaymentDate: installments[0].dueDate,
            interestRate
        };
    }
    // 获取可用贷款产品
    getAvailableProducts(creditScore, monthlyIncome) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allProducts = yield this.getAllLoanProducts();
                return allProducts.filter(product => {
                    // 基于信用分数和月收入筛选合适的产品
                    const maxLoanAmount = monthlyIncome * 12 * 0.4; // 最大贷款额度为年收入的40%
                    return (creditScore >= this.getMinCreditScore(product.type) &&
                        product.maxAmount <= maxLoanAmount);
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to get available loan products: ${error.message}`);
                }
                throw new Error('Failed to get available loan products: Unknown error');
            }
        });
    }
    // 验证申请数据
    validateApplication(application) {
        // 实现验证逻辑
    }
    // 生成唯一ID
    generateId() {
        return `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // 计算每月还款额
    calculateMonthlyPayment(principal, term, monthlyInterestRate) {
        return ((principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) /
            (Math.pow(1 + monthlyInterestRate, term) - 1));
    }
    // 获取最低信用分数要求
    getMinCreditScore(loanType) {
        const requirements = {
            [loan_1.LoanType.PERSONAL]: 600,
            [loan_1.LoanType.BUSINESS]: 650,
            [loan_1.LoanType.EDUCATION]: 580,
            [loan_1.LoanType.MORTGAGE]: 680
        };
        return requirements[loanType];
    }
    // 数据库操作方法
    saveLoanApplication(application) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现数据库保存逻辑
        });
    }
    getAllLoanProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取产品列表逻辑
            return [];
        });
    }
    startAutomaticReview(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现自动审核流程
        });
    }
}
exports.LoanService = LoanService;
