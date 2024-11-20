import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { performanceMonitor } from '../utils/performanceMonitor';

interface PerformanceReportProps {
  visible: boolean;
  onClose: () => void;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();
  const metrics = performanceMonitor.getMetrics();

  const getOperationGroups = () => {
    const groups = metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = [];
      }
      acc[metric.operation].push(metric);
      return acc;
    }, {} as Record<string, typeof metrics>);

    return Object.entries(groups).map(([operation, operationMetrics]) => ({
      operation,
      avgTime: performanceMonitor.getAverageOperationTime(operation),
      successRate: (operationMetrics.filter(m => m.success).length / operationMetrics.length) * 100,
      totalCalls: operationMetrics.length,
    }));
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('performance.title')}</Text>
      
      <ScrollView style={styles.content}>
        {getOperationGroups().map(group => (
          <View key={group.operation} style={styles.operationCard}>
            <Text style={styles.operationTitle}>
              {t(`performance.operations.${group.operation}`)}
            </Text>
            
            <View style={styles.metricsContainer}>
              <MetricItem
                label={t('performance.avgTime')}
                value={`${group.avgTime.toFixed(2)}ms`}
              />
              <MetricItem
                label={t('performance.successRate')}
                value={`${group.successRate.toFixed(1)}%`}
                color={group.successRate > 95 ? theme.colors.success : theme.colors.error}
              />
              <MetricItem
                label={t('performance.totalCalls')}
                value={group.totalCalls.toString()}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>{t('common.close')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const MetricItem: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color }) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, color && { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  content: {
    maxHeight: 400,
  },
  operationCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricItem: {
    flex: 1,
    minWidth: '30%',
    marginVertical: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerformanceReport; 