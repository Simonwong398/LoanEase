import { LoanProduct, LoanType } from '@models/loan/Product';
import { DatabaseService } from '@services/storage';
import { logger } from '@utils/logger';

export class LoanProductService {
  constructor(private db: DatabaseService) {}

  // 创建贷款产品
  async createProduct(product: Omit<LoanProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoanProduct> {
    try {
      const newProduct: LoanProduct = {
        ...product,
        id: `prod_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.db.execute(
        'INSERT INTO loan_products (id, type, name, description, min_amount, max_amount, interest_rate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newProduct.id, newProduct.type, newProduct.name, newProduct.description, newProduct.minAmount, newProduct.maxAmount, newProduct.interestRate, newProduct.createdAt, newProduct.updatedAt]
      );

      logger.info('Created new loan product', 'LoanProductService', { productId: newProduct.id });
      return newProduct;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Unknown error'
      );
      logger.error('Failed to create loan product', 'LoanProductService', error);
      throw error;
    }
  }

  // 获取可用贷款产品
  async getAvailableProducts(filters: {
    type?: LoanType;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<LoanProduct[]> {
    try {
      let query = 'SELECT * FROM loan_products WHERE is_active = true';
      const params: any[] = [];

      if (filters.type) {
        query += ' AND type = ?';
        params.push(filters.type);
      }
      if (filters.minAmount) {
        query += ' AND max_amount >= ?';
        params.push(filters.minAmount);
      }
      if (filters.maxAmount) {
        query += ' AND min_amount <= ?';
        params.push(filters.maxAmount);
      }

      return await this.db.query<LoanProduct>(query, params);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Unknown error'
      );
      logger.error('Failed to get available products', 'LoanProductService', error);
      throw error;
    }
  }

  // 检查贷款资格
  async checkEligibility(productId: string, userData: {
    creditScore: number;
    monthlyIncome: number;
    employmentYears: number;
  }): Promise<{
    eligible: boolean;
    maxAmount?: number;
    reasons?: string[];
  }> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const reasons: string[] = [];
      
      if (userData.creditScore < product.eligibilityCriteria.minCreditScore) {
        reasons.push('Credit score below minimum requirement');
      }
      if (userData.monthlyIncome < product.eligibilityCriteria.minIncome) {
        reasons.push('Income below minimum requirement');
      }
      if (userData.employmentYears < product.eligibilityCriteria.minEmploymentYears) {
        reasons.push('Employment history below minimum requirement');
      }

      const eligible = reasons.length === 0;
      const maxAmount = eligible ? this.calculateMaxLoanAmount(userData.monthlyIncome) : undefined;

      return { eligible, maxAmount, reasons };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Unknown error'
      );
      logger.error('Failed to check eligibility', 'LoanProductService', error);
      throw error;
    }
  }

  private async getProductById(id: string): Promise<LoanProduct | null> {
    const products = await this.db.query<LoanProduct>(
      'SELECT * FROM loan_products WHERE id = ?',
      [id]
    );
    return products[0] || null;
  }

  private calculateMaxLoanAmount(monthlyIncome: number): number {
    // 假设最大贷款额度为年收入的4倍
    return monthlyIncome * 12 * 4;
  }
} 