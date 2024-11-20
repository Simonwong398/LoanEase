import { ChartData } from '../components/charts/BaseChart';

interface DataAnalysis {
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    median: number;
    standardDeviation: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    changeRate: number;
    prediction?: number;
  };
  distribution: {
    [key: string]: number;
  };
}

interface ReportOptions {
  includeProjections?: boolean;
  confidenceLevel?: number;
  groupBy?: 'day' | 'week' | 'month';
}

class ReportGenerator {
  private static instance: ReportGenerator;

  private constructor() {}

  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  generateReport(data: ChartData, options: ReportOptions = {}): DataAnalysis {
    const allValues = data.datasets.flatMap(ds => ds.data);

    return {
      summary: this.generateSummary(allValues),
      trends: this.analyzeTrends(data, options),
      distribution: this.analyzeDistribution(allValues),
    };
  }

  private generateSummary(values: number[]): DataAnalysis['summary'] {
    const sorted = [...values].sort((a, b) => a - b);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;

    // 计算标准差
    const squareDiffs = values.map(value => {
      const diff = value - average;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const standardDeviation = Math.sqrt(avgSquareDiff);

    return {
      total,
      average,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      standardDeviation,
    };
  }

  private analyzeTrends(
    data: ChartData,
    options: ReportOptions
  ): DataAnalysis['trends'] {
    const lastDataset = data.datasets[data.datasets.length - 1].data;
    const firstValue = lastDataset[0];
    const lastValue = lastDataset[lastDataset.length - 1];
    const changeRate = (lastValue - firstValue) / firstValue;

    let prediction;
    if (options.includeProjections) {
      // 简单线性回归预测
      const xValues = Array.from({ length: lastDataset.length }, (_, i) => i);
      const { slope, intercept } = this.calculateRegression(xValues, lastDataset);
      prediction = slope * (lastDataset.length + 1) + intercept;
    }

    return {
      direction: changeRate > 0.05 ? 'up' : changeRate < -0.05 ? 'down' : 'stable',
      changeRate,
      prediction,
    };
  }

  private calculateRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private analyzeDistribution(values: number[]): DataAnalysis['distribution'] {
    const distribution: { [key: string]: number } = {};
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const bucketSize = range / 10;

    values.forEach(value => {
      const bucketIndex = Math.floor((value - min) / bucketSize);
      const bucketStart = min + bucketIndex * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const bucketKey = `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`;
      distribution[bucketKey] = (distribution[bucketKey] || 0) + 1;
    });

    return distribution;
  }
}

export const reportGenerator = ReportGenerator.getInstance(); 