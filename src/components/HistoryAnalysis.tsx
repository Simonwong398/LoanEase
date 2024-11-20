import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { historyManager, LoanHistory } from '../utils/historyManager';

type AnalysisDimension = 'amount' | 'rate' | 'term' | 'monthlyPayment';

const HistoryAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const stats = historyManager.getHistoryStats();
  const [selectedDimension, setSelectedDimension] = useState<AnalysisDimension>('amount');

  const getDimensionData = (dimension: AnalysisDimension) => {
    return {
      labels: Array.from({ length: stats.trends[dimension].length }, (_, i) => 
        (i + 1).toString()
      ),
      datasets: [
        {
          data: stats.trends[dimension],
          color: () => theme.colors.primary,
        },
      ],
    };
  };

  const getDistributionData = () => {
    const ranges = stats.distributions[selectedDimension];
    return Object.entries(ranges).map(([range, count]) => ({
      name: range,
      population: count,
      color: theme.colors.primary,
      legendFontColor: theme.colors.text.primary,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('history.analysis.title')}</Text>

      {/* 维度选择器 */}
      <View style={styles.dimensionSelector}>
        {(['amount', 'rate', 'term', 'monthlyPayment'] as AnalysisDimension[]).map(dimension => (
          <TouchableOpacity
            key={dimension}
            style={[
              styles.dimensionButton,
              selectedDimension === dimension && styles.selectedDimension
            ]}
            onPress={() => setSelectedDimension(dimension)}
          >
            <Text style={[
              styles.dimensionText,
              selectedDimension === dimension && styles.selectedDimensionText
            ]}>
              {t(`history.analysis.dimensions.${dimension}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 趋势图表 */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{t('history.analysis.trends')}</Text>
        <LineChart
          data={getDimensionData(selectedDimension)}
          width={Dimensions.get('window').width - theme.spacing.lg * 4}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          bezier
          withDots={false}
          withInnerLines={false}
        />
      </View>

      {/* 分布图表 */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{t('history.analysis.distribution')}</Text>
        <PieChart
          data={getDistributionData()}
          width={Dimensions.get('window').width - theme.spacing.lg * 4}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* 统计摘要 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('history.analysis.average')}</Text>
          <Text style={styles.statValue}>
            {stats.averages[selectedDimension].toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('history.analysis.median')}</Text>
          <Text style={styles.statValue}>
            {stats.medians[selectedDimension].toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('history.analysis.mode')}</Text>
          <Text style={styles.statValue}>
            {stats.modes[selectedDimension].toFixed(2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    margin: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
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
  commonSection: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  commonItem: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  dimensionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dimensionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedDimension: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dimensionText: {
    color: theme.colors.text.primary,
    fontSize: 14,
  },
  selectedDimensionText: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
});

export default HistoryAnalysis; 