import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { validationCache } from '../utils/validationCache';

const ValidationPerformanceReport: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = React.useState(validationCache.getDetailedStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(validationCache.getDetailedStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hitRateData = {
    labels: Object.keys(stats.hitRateByType),
    datasets: [{
      data: Object.values(stats.hitRateByType).map(rate => rate * 100),
    }],
  };

  const ageDistributionData = [
    {
      name: t('cache.fresh'),
      population: stats.ageDistribution.fresh,
      color: theme.colors.success,
      legendFontColor: theme.colors.text.primary,
    },
    {
      name: t('cache.recent'),
      population: stats.ageDistribution.recent,
      color: theme.colors.warning,
      legendFontColor: theme.colors.text.primary,
    },
    {
      name: t('cache.old'),
      population: stats.ageDistribution.old,
      color: theme.colors.error,
      legendFontColor: theme.colors.text.primary,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('performance.validation.title')}</Text>

      {/* 基础指标 */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>{t('performance.hitRate')}</Text>
          <Text style={styles.metricValue}>
            {(stats.avgHitRate * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>{t('performance.cacheSize')}</Text>
          <Text style={styles.metricValue}>{stats.size}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>{t('performance.avgAccessTime')}</Text>
          <Text style={styles.metricValue}>
            {stats.avgAccessTime.toFixed(2)}ms
          </Text>
        </View>
      </View>

      {/* 命中率图表 */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{t('performance.hitRateByType')}</Text>
        <LineChart
          data={hitRateData}
          width={styles.chart.width}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* 缓存年龄分布 */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{t('performance.ageDistribution')}</Text>
        <PieChart
          data={ageDistributionData}
          width={styles.chart.width}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* 持久化指标 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('performance.persistence')}</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>{t('performance.loadTime')}</Text>
          <Text style={styles.metricValue}>
            {stats.persistenceMetrics.loadTime.toFixed(2)}ms
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>{t('performance.saveTime')}</Text>
          <Text style={styles.metricValue}>
            {stats.persistenceMetrics.saveTime.toFixed(2)}ms
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>{t('performance.errorRate')}</Text>
          <Text style={styles.metricValue}>
            {(stats.persistenceMetrics.errorRate * 100).toFixed(2)}%
          </Text>
        </View>
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  chartContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  chart: {
    width: Dimensions.get('window').width - theme.spacing.lg * 4,
    borderRadius: theme.borderRadius.md,
  },
  section: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
});

export default ValidationPerformanceReport; 