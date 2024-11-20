import { PerformanceMetrics } from './performanceMetrics';
import { performanceWarningSystem } from './performanceWarningSystem';

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string[];
  actions: string[];
}

class PerformanceOptimizationAdvisor {
  private static instance: PerformanceOptimizationAdvisor;

  private constructor() {}

  static getInstance(): PerformanceOptimizationAdvisor {
    if (!PerformanceOptimizationAdvisor.instance) {
      PerformanceOptimizationAdvisor.instance = new PerformanceOptimizationAdvisor();
    }
    return PerformanceOptimizationAdvisor.instance;
  }

  generateSuggestions(metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const warnings = performanceWarningSystem.getWarnings();

    // 检查计算性能
    if (metrics.calculationTime > 1000) {
      suggestions.push({
        id: 'reduce_calculation_time',
        title: '优化计算性能',
        description: '计算耗时过长，可能影响用户体验',
        priority: 'high',
        impact: [
          '减少页面响应时间',
          '提升用户体验',
          '降低系统资源消耗'
        ],
        actions: [
          '使用批处理优化大量计算',
          '实现计算结果缓存',
          '优化计算算法'
        ]
      });
    }

    // 检查内存使用
    if (metrics.memoryUsage > 0.7) {
      suggestions.push({
        id: 'optimize_memory_usage',
        title: '优化内存使用',
        description: '内存使用率过高，可能导致性能下降',
        priority: 'high',
        impact: [
          '防止应用崩溃',
          '提升运行稳定性',
          '优化资源利用'
        ],
        actions: [
          '清理不必要的缓存数据',
          '优化大数据集处理方式',
          '实现数据分页加载'
        ]
      });
    }

    // 检查缓存效率
    if (metrics.cacheHitRate < 0.5) {
      suggestions.push({
        id: 'improve_cache_efficiency',
        title: '提升缓存效率',
        description: '缓存命中率较低，影响计算性能',
        priority: 'medium',
        impact: [
          '减少重复计算',
          '提升响应速度',
          '优化资源利用'
        ],
        actions: [
          '调整缓存策略',
          '优化缓存键的设计',
          '增加缓存预热机制'
        ]
      });
    }

    // 检查批处理效率
    if (metrics.batchLatency > 200) {
      suggestions.push({
        id: 'optimize_batch_processing',
        title: '优化批处理性能',
        description: '批处理延迟较高，影响处理效率',
        priority: 'medium',
        impact: [
          '提升批量处理速度',
          '优化资源利用',
          '改善用户体验'
        ],
        actions: [
          '调整批处理大小',
          '实现自适应批处理',
          '优化处理算法'
        ]
      });
    }

    return suggestions;
  }

  getPriorityOrder(priority: string): number {
    switch (priority) {
      case 'high': return 0;
      case 'medium': return 1;
      case 'low': return 2;
      default: return 3;
    }
  }

  sortSuggestionsByPriority(suggestions: OptimizationSuggestion[]): OptimizationSuggestion[] {
    return [...suggestions].sort((a, b) => 
      this.getPriorityOrder(a.priority) - this.getPriorityOrder(b.priority)
    );
  }
}

export const performanceOptimizationAdvisor = PerformanceOptimizationAdvisor.getInstance(); 