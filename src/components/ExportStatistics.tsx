import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportHistory } from '../types/export';
import { PieChart } from 'react-native-chart-kit';

interface ExportStatisticsProps {
  history: ExportHistory[];
}

const ExportStatistics: React.FC<ExportStatisticsProps> = ({ history }) => {
  const { t } = useLanguage();

  const calculateStats = () => {
    const total = history.length;
    const successful = history.filter(h => h.status === 'success').length;
    const failed = total - successful;

    const formatStats = history.reduce((acc, item) => {
      acc[item.format] = (acc[item.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSize = history.reduce((sum, item) => sum + (item.fileSize || 0), 0);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      formatStats,
      totalSize,
    };
  };

  const stats = calculateStats();

  const getColorForFormat = (format: string): string => {
    const color = theme.colors[format as keyof typeof theme.colors];
    return typeof color === 'string' ? color : theme.colors.primary;
  };

  const formatData = Object.entries(stats.formatStats).map(([format, count]) => ({
    name: format.toUpperCase(),
    population: count,
    color: getColorForFormat(format),
    legendFontColor: theme.colors.text.primary,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('export.statistics.title')}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('export.statistics.total')}</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('export.statistics.successful')}</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {stats.successful}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('export.statistics.failed')}</Text>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {stats.failed}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('export.statistics.successRate')}</Text>
          <Text style={styles.statValue}>
            {stats.successRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      {formatData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('export.statistics.formatDistribution')}</Text>
          <PieChart
            data={formatData}
            width={300}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      )}

      <View style={styles.totalSize}>
        <Text style={styles.totalSizeLabel}>{t('export.statistics.totalSize')}</Text>
        <Text style={styles.totalSizeValue}>
          {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
        </Text>
      </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    width: '50%',
    padding: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  chartContainer: {
    marginVertical: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  totalSize: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalSizeLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  totalSizeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
});

export default ExportStatistics; 