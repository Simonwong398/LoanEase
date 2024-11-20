import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentMethod } from './loanCalculations';
import { precise } from './mathUtils';

export type AnalysisDimension = 'amount' | 'rate' | 'term' | 'monthlyPayment';

export interface LoanHistory {
  id: string;
  date: string;
  loanType: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  paymentMethod: 'equalPayment' | 'equalPrincipal';
  schedule: PaymentMethod['schedule'];
  city?: string;
  tags?: string[];
}

interface HistoryStats {
  totalCount: number;
  averages: Record<AnalysisDimension, number>;
  medians: Record<AnalysisDimension, number>;
  modes: Record<AnalysisDimension, number>;
  trends: Record<AnalysisDimension, number[]>;
  distributions: Record<AnalysisDimension, Record<string, number>>;
  mostCommonCity?: string;
  mostCommonLoanType?: string;
}

class HistoryManager {
  private static instance: HistoryManager;
  private readonly STORAGE_KEY = '@loan_history';
  private readonly MAX_HISTORY_ITEMS = 100;
  private history: LoanHistory[] = [];

  private constructor() {
    this.loadHistory();
  }

  static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager();
    }
    return HistoryManager.instance;
  }

  private async loadHistory(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.history = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  async addRecord(record: Omit<LoanHistory, 'id' | 'date'>): Promise<void> {
    const newRecord: LoanHistory = {
      ...record,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    this.history.unshift(newRecord);
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history.pop();
    }
    await this.saveHistory();
  }

  async searchHistory(query: {
    startDate?: Date;
    endDate?: Date;
    loanType?: string;
    city?: string;
    minAmount?: number;
    maxAmount?: number;
    tags?: string[];
  }): Promise<LoanHistory[]> {
    return this.history.filter(record => {
      const date = new Date(record.date);
      
      if (query.startDate && date < query.startDate) return false;
      if (query.endDate && date > query.endDate) return false;
      if (query.loanType && record.loanType !== query.loanType) return false;
      if (query.city && record.city !== query.city) return false;
      if (query.minAmount && record.amount < query.minAmount) return false;
      if (query.maxAmount && record.amount > query.maxAmount) return false;
      if (query.tags && !query.tags.every(tag => record.tags?.includes(tag))) {
        return false;
      }

      return true;
    });
  }

  getHistoryStats(): HistoryStats {
    const dimensions: AnalysisDimension[] = ['amount', 'rate', 'term', 'monthlyPayment'];
    
    const stats: HistoryStats = {
      totalCount: this.history.length,
      averages: {} as Record<AnalysisDimension, number>,
      medians: {} as Record<AnalysisDimension, number>,
      modes: {} as Record<AnalysisDimension, number>,
      trends: {} as Record<AnalysisDimension, number[]>,
      distributions: {} as Record<AnalysisDimension, Record<string, number>>,
    };

    if (this.history.length === 0) return stats;

    // 计算每个维度的统计数据
    dimensions.forEach(dimension => {
      const values = this.history.map(record => record[dimension]);
      
      // 计算平均值
      stats.averages[dimension] = precise.divide(
        values.reduce((sum, val) => precise.add(sum, val), 0),
        values.length
      );

      // 计算中位数
      const sortedValues = [...values].sort((a, b) => a - b);
      const mid = Math.floor(values.length / 2);
      stats.medians[dimension] = values.length % 2 === 0
        ? precise.divide(sortedValues[mid - 1] + sortedValues[mid], 2)
        : sortedValues[mid];

      // 计算众数
      const counts = new Map<number, number>();
      values.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
      const maxCount = Math.max(...counts.values());
      stats.modes[dimension] = Array.from(counts.entries())
        .find(([_, count]) => count === maxCount)?.[0] || 0;

      // 计算趋势
      stats.trends[dimension] = this.history
        .slice(0, 12)
        .map(record => record[dimension])
        .reverse();

      // 计算分布
      stats.distributions[dimension] = this.calculateDistribution(values, dimension);
    });

    return stats;
  }

  private calculateDistribution(
    values: number[],
    dimension: AnalysisDimension
  ): Record<string, number> {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const bucketCount = 5;
    const bucketSize = range / bucketCount;

    const distribution: Record<string, number> = {};
    values.forEach(value => {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketSize),
        bucketCount - 1
      );
      const bucketStart = min + bucketIndex * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const bucketLabel = `${bucketStart.toFixed(0)}-${bucketEnd.toFixed(0)}`;
      distribution[bucketLabel] = (distribution[bucketLabel] || 0) + 1;
    });

    return distribution;
  }

  async exportHistory(format: 'csv' | 'excel'): Promise<string> {
    // 实现导出逻辑
    return '';
  }

  async deleteRecord(id: string): Promise<void> {
    this.history = this.history.filter(record => record.id !== id);
    await this.saveHistory();
  }

  async clearHistory(): Promise<void> {
    this.history = [];
    await this.saveHistory();
  }
}

export const historyManager = HistoryManager.getInstance(); 