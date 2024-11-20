import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { CostAnalysis } from '../utils/loanCostAnalyzer';

interface LoanCostAnalysisChartsProps {
  analysis: CostAnalysis;
}

const LoanCostAnalysisCharts: React.FC<LoanCostAnalysisChartsProps> = ({
  analysis,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  // 年度还款构成图表数据
  const yearlyPaymentData = {
    labels: Array.from({ length: analysis.yearlyPayment.length }, (_, i) => `${i + 1}`),
    datasets: [
      {
        data: analysis.yearlyPrincipal,
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
      {
        data: analysis.yearlyInterest,
        color: () => theme.colors.secondary,
        strokeWidth: 2,
      },
    ],
    legend: [t('analysis.principal'), t('analysis.interest')],
  };

  // 利率敏感性图表数据
  const sensitivityData = {
    labels: analysis.rateSensitivity.map(item => `${item.rate}%`),
    datasets: [
      {
        data: analysis.rateSensitivity.map(item => item.monthlyPayment),
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  // 还款方式对比图表数据
  const methodComparisonData = {
    labels: [t('analysis.equalPayment'), t('analysis.equalPrincipal')],
    datasets: [
      {
        data: [
          analysis.methodComparison.equalPayment.totalInterest,
          analysis.methodComparison.equalPrincipal.totalInterest,
        ],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('analysis.costAnalysis')}</Text>

      {/* 基础成本分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.basicCost')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('analysis.totalCost')}</Text>
            <Text style={styles.statValue}>¥{analysis.totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('analysis.interestRatio')}</Text>
            <Text style={styles.statValue}>
              {(analysis.interestRatio * 100).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* 年度还款构成 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.yearlyPayment')}</Text>
        <LineChart
          data={yearlyPaymentData}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* 利率敏感性分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.rateSensitivity')}</Text>
        <LineChart
          data={sensitivityData}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* 还款方式对比 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.methodComparison')}</Text>
        <BarChart
          data={methodComparisonData}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
        <View style={styles.comparisonDetails}>
          <Text style={styles.comparisonText}>
            {t('analysis.interestDifference')}: 
            ¥{Math.abs(analysis.methodComparison.difference.totalInterest).toFixed(2)}
          </Text>
          <Text style={styles.comparisonText}>
            {t('analysis.monthlyPaymentRange')}: 
            ¥{analysis.methodComparison.equalPrincipal.schedule[analysis.methodComparison.equalPrincipal.schedule.length - 1].payment.toFixed(2)} 
            - 
            ¥{analysis.methodComparison.equalPrincipal.schedule[0].payment.toFixed(2)}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    padding: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  comparisonDetails: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  comparisonText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
});

export default LoanCostAnalysisCharts; 