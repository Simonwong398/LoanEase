import { 
  LoanApplication, 
  LoanStatus, 
  LoanType,
  RepaymentSchedule,
  LoanProduct,
  Installment 
} from '../models/loan';

export class LoanService {
  // 提交贷款申请
  async submitApplication(application: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>): Promise<LoanApplication> {
    try {
      // 验证申请数据
      this.validateApplication(application);

      // 创建申请记录
      const newApplication: LoanApplication = {
        ...application,
        id: this.generateId(),
        status: LoanStatus.PENDING,
        submittedAt: new Date(),
      };

      // 保存到数据库
      await this.saveLoanApplication(newApplication);

      // 开始自动审核流程
      this.startAutomaticReview(newApplication.id);

      return newApplication;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit loan application: ${error.message}`);
      }
      throw new Error('Failed to submit loan application: Unknown error');
    }
  }

  // 计算还款计划
  calculateRepaymentSchedule(
    amount: number,
    term: number,
    interestRate: number
  ): RepaymentSchedule {
    const monthlyInterestRate = interestRate / 12 / 100;
    const monthlyPayment = this.calculateMonthlyPayment(amount, term, monthlyInterestRate);
    
    const installments: Installment[] = [];
    let remainingPrincipal = amount;
    let currentDate = new Date();

    for (let i = 0; i < term; i++) {
      const interest = remainingPrincipal * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      remainingPrincipal -= principal;

      currentDate.setMonth(currentDate.getMonth() + 1);

      const installment: Installment = {
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
  async getAvailableProducts(
    creditScore: number,
    monthlyIncome: number
  ): Promise<LoanProduct[]> {
    try {
      const allProducts = await this.getAllLoanProducts();
      
      return allProducts.filter(product => {
        // 基于信用分数和月收入筛选合适的产品
        const maxLoanAmount = monthlyIncome * 12 * 0.4; // 最大贷款额度为年收入的40%
        return (
          creditScore >= this.getMinCreditScore(product.type) &&
          product.maxAmount <= maxLoanAmount
        );
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get available loan products: ${error.message}`);
      }
      throw new Error('Failed to get available loan products: Unknown error');
    }
  }

  // 验证申请数据
  private validateApplication(application: any): void {
    // 实现验证逻辑
  }

  // 生成唯一ID
  private generateId(): string {
    return `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 计算每月还款额
  private calculateMonthlyPayment(
    principal: number,
    term: number,
    monthlyInterestRate: number
  ): number {
    return (
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) /
      (Math.pow(1 + monthlyInterestRate, term) - 1)
    );
  }

  // 获取最低信用分数要求
  private getMinCreditScore(loanType: LoanType): number {
    const requirements = {
      [LoanType.PERSONAL]: 600,
      [LoanType.BUSINESS]: 650,
      [LoanType.EDUCATION]: 580,
      [LoanType.MORTGAGE]: 680
    };
    return requirements[loanType];
  }

  // 数据库操作方法
  private async saveLoanApplication(application: LoanApplication): Promise<void> {
    // 实现数据库保存逻辑
  }

  private async getAllLoanProducts(): Promise<LoanProduct[]> {
    // 实现获取产品列表逻辑
    return [];
  }

  private async startAutomaticReview(applicationId: string): Promise<void> {
    // 实现自动审核流程
  }
} 