import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { performanceMonitor } from '../utils/performanceMonitor';

interface OptimizationTip {
  id: string;
  condition: () => boolean;
  severity: 'high' | 'medium' | 'low';
}

const PerformanceOptimizationTips: React.FC = () => {
  const { t } = useLanguage();
  const metrics = performanceMonitor.getMetrics();

  const optimizationTips: OptimizationTip[] = [
    {
      id: 'highCalculationTime',
      condition: () => {
        const avgTime = performanceMonitor.getAverageOperationTime('calculateLoan');
        return avgTime > 500; // 如果计算时间超过500ms
      },
      severity: 'high'
    },
    {
      id: 'frequentRecalculation',
      condition: () => {
        const calcCount = metrics.filter(m => m.operation === 'calculateLoan').length;
        return calcCount > 10; // 如果短时间内计算次数过多
      },
      severity: 'medium'
    },
    {
      id: 'largeDataSet',
      condition: () => {
        return metrics.length > 100; // 如果历史记录过多
      },
      severity: 'low'
    }
  ];

  const getRelevantTips = () => 
    optimizationTips.filter(tip => tip.condition());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('performance.optimizationTips')}</Text>
      <ScrollView>
        {getRelevantTips().map(tip => (
          <View 
            key={tip.id} 
            style={[styles.tipContainer, styles[`${tip.severity}Priority`]]}
          >
            <Text style={styles.tipTitle}>
              {t(`performance.tips.${tip.id}.title`)}
            </Text>
            <Text style={styles.tipDescription}>
              {t(`performance.tips.${tip.id}.description`)}
            </Text>
            <Text style={styles.suggestion}>
              {t(`performance.tips.${tip.id}.suggestion`)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  tipContainer: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
  },
  highPriority: {
    borderLeftColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}10`,
  },
  mediumPriority: {
    borderLeftColor: theme.colors.warning,
    backgroundColor: `${theme.colors.warning}10`,
  },
  lowPriority: {
    borderLeftColor: theme.colors.success,
    backgroundColor: `${theme.colors.success}10`,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  tipDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  suggestion: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
  },
});

export default PerformanceOptimizationTips; 