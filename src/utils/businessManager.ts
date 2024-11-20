import AsyncStorage from '@react-native-async-storage/async-storage';
import { auditManager } from './auditManager';

// 贷款类型定义
interface LoanType {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  requirements: string[];
}

// 保险产品定义
interface InsuranceProduct {
  id: string;
  type: 'life' | 'health' | 'property' | 'accident';
  name: string;
  description: string;
  coverage: number;
  premium: number;
  term: number;
  benefits: string[];
}

// 投资产品定义
interface InvestmentProduct {
  id: string;
  type: 'fund' | 'stock' | 'bond' | 'deposit';
  name: string;
  risk: 'low' | 'medium' | 'high';
  expectedReturn: number;
  minInvestment: number;
  term?: number;
  features: string[];
}

// 税费计算配置
interface TaxConfig {
  personalTaxRate: number[];
  vatRate: number;
  propertyTaxRate: number;
  deductions: {
    [key: string]: number;
  };
}

// 政策法规
interface Regulation {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  effectiveDate: string;
  category: string[];
  source: string;
}

class BusinessManager {
  private static instance: BusinessManager;
  private loanTypes: Map<string, LoanType> = new Map();
  private insuranceProducts: Map<string, InsuranceProduct> = new Map();
  private investmentProducts: Map<string, InvestmentProduct> = new Map();
  private taxConfig: TaxConfig | null = null;
  private regulations: Map<string, Regulation> = new Map();

  private constructor() {
    this.initialize();
  }

  static getInstance(): BusinessManager {
    if (!BusinessManager.instance) {
      BusinessManager.instance = new BusinessManager();
    }
    return BusinessManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadLoanTypes(),
        this.loadInsuranceProducts(),
        this.loadInvestmentProducts(),
        this.loadTaxConfig(),
        this.loadRegulations(),
      ]);

      await auditManager.logEvent({
        type: 'business',
        action: 'initialize',
        status: 'success',
        details: {
          loanTypesCount: this.loanTypes.size,
          insuranceProductsCount: this.insuranceProducts.size,
          investmentProductsCount: this.investmentProducts.size,
        },
      });
    } catch (error) {
      console.error('Business manager initialization failed:', error);
      await auditManager.logEvent({
        type: 'business',
        action: 'initialize',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  // 贷款相关方法
  async calculateLoan(
    loanTypeId: string,
    amount: number,
    term: number
  ): Promise<{
    monthlyPayment: number;
    totalInterest: number;
    totalPayment: number;
    schedule: Array<{ month: number; payment: number; principal: number; interest: number; balance: number; }>;
  }> {
    const loanType = this.loanTypes.get(loanTypeId);
    if (!loanType) throw new Error('Invalid loan type');

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
  }

  // 保险相关方法
  async calculateInsurancePremium(
    productId: string,
    age: number,
    coverage: number
  ): Promise<number> {
    const product = this.insuranceProducts.get(productId);
    if (!product) throw new Error('Invalid insurance product');

    // 实现保费计算逻辑
    const basePremium = (coverage / 10000) * product.premium;
    const ageMultiplier = 1 + Math.max(0, age - 25) * 0.02;

    return basePremium * ageMultiplier;
  }

  // 投资建议相关方法
  async getInvestmentAdvice(
    amount: number,
    term: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): Promise<InvestmentProduct[]> {
    const suitable = Array.from(this.investmentProducts.values()).filter(product => {
      return product.risk === riskTolerance &&
             product.minInvestment <= amount &&
             (!product.term || product.term <= term);
    });

    return suitable.sort((a, b) => b.expectedReturn - a.expectedReturn);
  }

  // 税费计算方法
  calculatePersonalTax(annualIncome: number): number {
    if (!this.taxConfig) throw new Error('Tax config not loaded');

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
  async searchRegulations(query: string): Promise<Regulation[]> {
    const results = Array.from(this.regulations.values()).filter(reg => {
      return reg.title.includes(query) ||
             reg.content.includes(query) ||
             reg.category.some(cat => cat.includes(query));
    });

    return results.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  // 私有加载方法
  private async loadLoanTypes(): Promise<void> {
    const data = await AsyncStorage.getItem('@loan_types');
    if (data) {
      this.loanTypes = new Map(JSON.parse(data));
    }
  }

  private async loadInsuranceProducts(): Promise<void> {
    const data = await AsyncStorage.getItem('@insurance_products');
    if (data) {
      this.insuranceProducts = new Map(JSON.parse(data));
    }
  }

  private async loadInvestmentProducts(): Promise<void> {
    const data = await AsyncStorage.getItem('@investment_products');
    if (data) {
      this.investmentProducts = new Map(JSON.parse(data));
    }
  }

  private async loadTaxConfig(): Promise<void> {
    const data = await AsyncStorage.getItem('@tax_config');
    if (data) {
      this.taxConfig = JSON.parse(data);
    }
  }

  private async loadRegulations(): Promise<void> {
    const data = await AsyncStorage.getItem('@regulations');
    if (data) {
      this.regulations = new Map(JSON.parse(data));
    }
  }
}

export const businessManager = BusinessManager.getInstance(); 