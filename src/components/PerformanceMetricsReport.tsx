import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { performanceMetricsCollector } from '../utils/performanceMetrics';

const PerformanceMetricsReport: React.FC = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = React.useState(performanceMetricsCollector.getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMetricsCollector.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, unit: string = '') => {
    return `${value.toFixed(2)}${unit}`;
  };

  const renderMetricItem = (label: string, value: number, unit: string = '') => (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{formatValue(value, unit)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('performance.metrics.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('performance.metrics.calculation')}</Text>
        {renderMetricItem(t('performance.metrics.calculationTime'), metrics.calculationTime, 'ms')}
        {renderMetricItem(t('performance.metrics.operationsPerSecond'), metrics.operationsPerSecond, '/s')}
        {renderMetricItem(t('performance.metrics.cacheHitRate'), metrics.cacheHitRate * 100, '%')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('performance.metrics.memory')}</Text>
        {renderMetricItem(t('performance.metrics.memoryUsage'), metrics.memoryUsage * 100, '%')}
        {renderMetricItem(t('performance.metrics.peakMemoryUsage'), metrics.peakMemoryUsage * 100, '%')}
        {renderMetricItem(t('performance.metrics.gcCollections'), metrics.gcCollections)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('performance.metrics.batch')}</Text>
        {renderMetricItem(t('performance.metrics.avgBatchSize'), metrics.avgBatchSize)}
        {renderMetricItem(t('performance.metrics.batchThroughput'), metrics.batchThroughput, '/s')}
        {renderMetricItem(t('performance.metrics.batchLatency'), metrics.batchLatency, 'ms')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('performance.metrics.system')}</Text>
        {renderMetricItem(t('performance.metrics.cpuUsage'), metrics.cpuUsage * 100, '%')}
        {renderMetricItem(t('performance.metrics.threadCount'), metrics.threadCount)}
        {renderMetricItem(t('performance.metrics.ioOperations'), metrics.ioOperations)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    margin: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  section: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
});

export default PerformanceMetricsReport; 