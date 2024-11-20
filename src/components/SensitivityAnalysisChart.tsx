import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, ChartConfig } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { SensitivityAnalysis } from '../utils/sensitivityAnalysis';

interface SensitivityAnalysisChartProps {
  analyses: SensitivityAnalysis[];
}

const SensitivityAnalysisChart: React.FC<SensitivityAnalysisChartProps> = ({
  analyses,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  const chartConfig: ChartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    style: {
      borderRadius: theme.borderRadius.md,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForLabels: {
      fill: theme.colors.text.secondary,
    },
  };

  const formatChartData = (analysis: SensitivityAnalysis) => {
    return {
      labels: analysis.results.map(r => r.value.toString()),
      datasets: [
        {
          data: analysis.results.map(r => r.monthlyPayment),
          color: () => theme.colors.primary,
          strokeWidth: 2,
        },
        {
          data: analysis.results.map(r => r.totalInterest),
          color: () => theme.colors.secondary,
          strokeWidth: 2,
        },
      ],
      legend: [t('sensitivity.monthlyPayment'), t('sensitivity.totalInterest')],
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sensitivity.title')}</Text>

      {analyses.map((analysis, index) => (
        <View key={index} style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {t(`sensitivity.${analysis.parameter}Title`)}
          </Text>
          <LineChart
            data={formatChartData(analysis)}
            width={screenWidth - theme.spacing.lg * 2}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <View style={styles.analysisDetails}>
            {analysis.results.map((result, i) => (
              <View key={i} style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t(`sensitivity.${analysis.parameter}`)} {result.value}
                </Text>
                <View style={styles.detailValues}>
                  <Text style={styles.detailValue}>
                    ¥{result.monthlyPayment.toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.percentageChange,
                    { color: result.percentageChange > 0 ? theme.colors.error : theme.colors.success }
                  ]}>
                    {result.percentageChange > 0 ? '+' : ''}
                    {result.percentageChange.toFixed(2)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
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
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: theme.spacing.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  analysisDetails: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  detailValues: {
    alignItems: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  percentageChange: {
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
});

export default SensitivityAnalysisChart; 