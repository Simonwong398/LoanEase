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
exports.businessManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const auditManager_1 = require("./auditManager");
class BusinessManager {
    constructor() {
        this.loanTypes = new Map();
        this.insuranceProducts = new Map();
        this.investmentProducts = new Map();
        this.taxConfig = null;
        this.regulations = new Map();
        this.initialize();
    }
    static getInstance() {
        if (!BusinessManager.instance) {
            BusinessManager.instance = new BusinessManager();
        }
        return BusinessManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all([
                    this.loadLoanTypes(),
                    this.loadInsuranceProducts(),
                    this.loadInvestmentProducts(),
                    this.loadTaxConfig(),
                    this.loadRegulations(),
                ]);
                yield auditManager_1.auditManager.logEvent({
                    type: 'business',
                    action: 'initialize',
                    status: 'success',
                    details: {
                        loanTypesCount: this.loanTypes.size,
                        insuranceProductsCount: this.insuranceProducts.size,
                        investmentProductsCount: this.investmentProducts.size,
                    },
                });
            }
            catch (error) {
                console.error('Business manager initialization failed:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'business',
                    action: 'initialize',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    // 贷款相关方法
    calculateLoan(loanTypeId, amount, term) {
        return __awaiter(this, void 0, void 0, function* () {
            const loanType = this.loanTypes.get(loanTypeId);
            if (!loanType)
                throw new Error('Invalid loan type');
            if (amount < loanType.minAmount || amount > loanType.maxAmount) {
                throw new Error('Amount out of range');
            }
            if (term < loanType.minTerm || term > loanType.maxTerm) {
                throw new Error('Term out of range');
            }
            const monthlyRate = loanType.baseRate / 12 / 100;
            const totalMonths = term * 12;
            const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
            const schedule = [];
            let balance = amount;
            let totalInterest = 0;
            for (let month = 1; month <= totalMonths; month++) {
                const interest = balance * monthlyRate;
                const principal = monthlyPayment - interest;
                balance -= principal;
                totalInterest += interest;
                schedule.push({
                    month,
                    payment: monthlyPayment,
                    principal,
                    interest,
                    balance: Math.max(0, balance),
                });
            }
            return {
                monthlyPayment,
                totalInterest,
                totalPayment: monthlyPayment * totalMonths,
                schedule,
            };
        });
    }
    // 保险相关方法
    calculateInsurancePremium(productId, age, coverage) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = this.insuranceProducts.get(productId);
            if (!product)
                throw new Error('Invalid insurance product');
            // 实现保费计算逻辑
            const basePremium = (coverage / 10000) * product.premium;
            const ageMultiplier = 1 + Math.max(0, age - 25) * 0.02;
            return basePremium * ageMultiplier;
        });
    }
    // 投资建议相关方法
    getInvestmentAdvice(amount, term, riskTolerance) {
        return __awaiter(this, void 0, void 0, function* () {
            const suitable = Array.from(this.investmentProducts.values()).filter(product => {
                return product.risk === riskTolerance &&
                    product.minInvestment <= amount &&
                    (!product.term || product.term <= term);
            });
            return suitable.sort((a, b) => b.expectedReturn - a.expectedReturn);
        });
    }
    // 税费计算方法
    calculatePersonalTax(annualIncome) {
        if (!this.taxConfig)
            throw new Error('Tax config not loaded');
        let tax = 0;
        let remainingIncome = annualIncome;
        const rates = this.taxConfig.personalTaxRate;
        // 简化的个税计算逻辑
        const brackets = [0, 36000, 144000, 300000, 420000, 660000, 960000];
        for (let i = rates.length - 1; i >= 0; i--) {
            if (remainingIncome > brackets[i]) {
                tax += (remainingIncome - brackets[i]) * rates[i];
                remainingIncome = brackets[i];
            }
        }
        return tax;
    }
    // 政策法规查询方法
    searchRegulations(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = Array.from(this.regulations.values()).filter(reg => {
                return reg.title.includes(query) ||
                    reg.content.includes(query) ||
                    reg.category.some(cat => cat.includes(query));
            });
            return results.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        });
    }
    // 私有加载方法
    loadLoanTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield async_storage_1.default.getItem('@loan_types');
            if (data) {
                this.loanTypes = new Map(JSON.parse(data));
            }
        });
    }
    loadInsuranceProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield async_storage_1.default.getItem('@insurance_products');
            if (data) {
                this.insuranceProducts = new Map(JSON.parse(data));
            }
        });
    }
    loadInvestmentProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield async_storage_1.default.getItem('@investment_products');
            if (data) {
                this.investmentProducts = new Map(JSON.parse(data));
            }
        });
    }
    loadTaxConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield async_storage_1.default.getItem('@tax_config');
            if (data) {
                this.taxConfig = JSON.parse(data);
            }
        });
    }
    loadRegulations() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield async_storage_1.default.getItem('@regulations');
            if (data) {
                this.regulations = new Map(JSON.parse(data));
            }
        });
    }
}
exports.businessManager = BusinessManager.getInstance();
