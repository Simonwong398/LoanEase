import { LoanHistory } from '../types/loan';
import { reportGenerator } from './reportGenerator';

interface LoanRecommendation {
  amount: number;
  term: number;
  rate: number;
  monthlyPayment: number;
  confidence: number;
  reason: string;
}

interface RateProjection {
  date: string;
  rate: number;
  probability: number;
  trend: 'up' | 'down' | 'stable';
}

interface RepaymentPlan {
  type: 'normal' | 'early' | 'extra';
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  duration: number;
  savings: number;
}

interface FinancialAdvice {
  type: 'saving' | 'investment' | 'debt' | 'budget';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  suggestions: string[];
  maxAffordablePayment: number;
}

class RecommendationManager {
  private static instance: RecommendationManager;
  private loanHistory: LoanHistory[] = [];

  private constructor() {}

  static getInstance(): RecommendationManager {
    if (!RecommendationManager.instance) {
      RecommendationManager.instance = new RecommendationManager();
    }
    return RecommendationManager.instance;
  }

  /**
   * 基于历史数据推荐贷款方案
   */
  async recommendLoan(
    income: number,
    expenses: number,
    purpose: string
  ): Promise<LoanRecommendation> {
    // 分析历史数据
    const historicalAnalysis = reportGenerator.generateReport({
      labels: this.loanHistory.map(h => h.createdAt.toString()),
      datasets: [{
        data: this.loanHistory.map(h => h.amount),
        label: 'Loan Amount'
      }]
    });

    // 计算最大可承受月供
    const maxMonthlyPayment = this.calculateMaxPayment(income, expenses);
    
    // 基于历史数据和当前状况推荐贷款金额
    const recommendedAmount = this.calculateRecommendedAmount(
      historicalAnalysis,
      maxMonthlyPayment
    );

    return {
      amount: recommendedAmount,
      term: this.recommendTerm(recommendedAmount, maxMonthlyPayment),
      rate: await this.predictRate(recommendedAmount, purpose),
      monthlyPayment: maxMonthlyPayment * 0.8, // 留出20%缓冲
      confidence: 0.85,
      reason: '基于您的收入和历史记录推荐',
    };
  }

  /**
   * 预测未来利率走势
   */
  async predictRates(months: number): Promise<RateProjection[]> {
    // 使用时间序列分析预测利率趋势
    const historicalRates = this.loanHistory.map(h => ({
      date: new Date(h.createdAt),
      rate: h.rate
    }));

    return Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      // 这里应该使用更复杂的时间序列分析
      const prediction = this.calculateRatePrediction(historicalRates, date);
      
      return {
        date: date.toISOString(),
        rate: prediction.rate,
        probability: prediction.probability,
        trend: prediction.trend,
      };
    });
  }

  /**
   * 推荐最优还款方案
   */
  recommendRepaymentPlans(
    loanAmount: number,
    rate: number,
    maxTerm: number
  ): RepaymentPlan[] {
    const plans: RepaymentPlan[] = [];
    
    // 常规还款方案
    plans.push(this.calculateNormalPlan(loanAmount, rate, maxTerm));
    
    // 提前还款方案
    if (maxTerm > 5) {
      plans.push(this.calculateEarlyPlan(loanAmount, rate, maxTerm));
    }
    
    // 额外还款方案
    plans.push(this.calculateExtraPlan(loanAmount, rate, maxTerm));
    
    return plans.sort((a, b) => a.totalInterest - b.totalInterest);
  }

  /**
   * 生成个性化理财建议
   */
  generateFinancialAdvice(
    income: number,
    expenses: number,
    savings: number,
    debt: number
  ): FinancialAdvice[] {
    const advice: FinancialAdvice[] = [];
    
    // 储蓄建议
    const savingRatio = savings / income;
    if (savingRatio < 0.2) {
      advice.push({
        type: 'saving',
        title: '增加储蓄',
        description: '建议将收入的20%用于储蓄',
        priority: 'high',
        impact: 0.8,
      });
    }
    
    // 债务管理建议
    const debtRatio = debt / income;
    if (debtRatio > 0.4) {
      advice.push({
        type: 'debt',
        title: '控制债务',
        description: '当前债务收入比过高，建议控制支出',
        priority: 'high',
        impact: 0.9,
      });
    }
    
    return advice;
  }

  /**
   * 评估贷款风险
   */
  assessRisk(
    income: number,
    expenses: number,
    loanAmount: number,
    term: number,
    rate: number
  ): RiskAssessment {
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, rate, term);
    const paymentRatio = monthlyPayment / (income - expenses);
    
    const factors: string[] = [];
    if (paymentRatio > 0.5) {
      factors.push('月供收入比过高');
    }
    
    const maxPayment = (income - expenses) * 0.5;
    
    return {
      level: paymentRatio > 0.5 ? 'high' : paymentRatio > 0.3 ? 'medium' : 'low',
      factors,
      suggestions: this.generateRiskSuggestions(factors),
      maxAffordablePayment: maxPayment,
    };
  }

  // 私有辅助方法...
  private calculateMaxPayment(income: number, expenses: number): number {
    return (income - expenses) * 0.5; // 最大月供不超过可支配收入的50%
  }

  private calculateRecommendedAmount(analysis: any, maxPayment: number): number {
    // 实现推荐金额计算逻辑
    return maxPayment * 100; // 示例
  }

  private recommendTerm(amount: number, maxPayment: number): number {
    return Math.ceil(amount / (maxPayment * 12));
  }

  private async predictRate(amount: number, purpose: string): Promise<number> {
    // 实现利率预测逻辑
    return 4.65;
  }

  private calculateRatePrediction(historicalRates: any[], date: Date): any {
    // 实现利率预测逻辑
    return {
      rate: 4.65,
      probability: 0.8,
      trend: 'stable' as const,
    };
  }

  private calculateMonthlyPayment(
    amount: number,
    rate: number,
    term: number
  ): number {
    const monthlyRate = rate / 12 / 100;
    const months = term * 12;
    return (
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  }

  private calculateNormalPlan(
    amount: number,
    rate: number,
    term: number
  ): RepaymentPlan {
    const monthlyPayment = this.calculateMonthlyPayment(amount, rate, term);
    const totalPayment = monthlyPayment * term * 12;
    
    return {
      type: 'normal',
      monthlyPayment,
      totalInterest: totalPayment - amount,
      totalPayment,
      duration: term * 12,
      savings: 0,
    };
  }

  private calculateEarlyPlan(
    amount: number,
    rate: number,
    term: number
  ): RepaymentPlan {
    const newTerm = Math.floor(term * 0.8); // 提前20%还完
    const monthlyPayment = this.calculateMonthlyPayment(amount, rate, newTerm);
    const totalPayment = monthlyPayment * newTerm * 12;
    const normalPlan = this.calculateNormalPlan(amount, rate, term);
    
    return {
      type: 'early',
      monthlyPayment,
      totalInterest: totalPayment - amount,
      totalPayment,
      duration: newTerm * 12,
      savings: normalPlan.totalPayment - totalPayment,
    };
  }

  private calculateExtraPlan(
    amount: number,
    rate: number,
    term: number
  ): RepaymentPlan {
    const basePayment = this.calculateMonthlyPayment(amount, rate, term);
    const extraPayment = basePayment * 0.2; // 每月多还20%
    const totalPayment = (basePayment + extraPayment) * term * 10; // 估算提前还款后的总还���
    const normalPlan = this.calculateNormalPlan(amount, rate, term);
    
    return {
      type: 'extra',
      monthlyPayment: basePayment + extraPayment,
      totalInterest: totalPayment - amount,
      totalPayment,
      duration: term * 10,
      savings: normalPlan.totalPayment - totalPayment,
    };
  }

  private generateRiskSuggestions(factors: string[]): string[] {
    return factors.map(factor => {
      switch (factor) {
        case '月供收入比过高':
          return '建议延长贷款期限或降低贷款金额';
        default:
          return '建议谨慎评估还款能力';
      }
    });
  }
}

export const recommendationManager = RecommendationManager.getInstance(); 