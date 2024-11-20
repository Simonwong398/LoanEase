import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentMethod } from '../utils/loanCalculations';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface LoanPlan {
  id: string;
  name: string;
  data: PaymentMethod;
  color: string;
}

interface LoanPlanComparisonProps {
  plans: LoanPlan[];
  onSelectPlan?: (planId: string) => void;
}

const LoanPlanComparison: React.FC<LoanPlanComparisonProps> = ({
  plans,
  onSelectPlan,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  // 计算每月还款对比数据
  const getMonthlyPaymentData = () => {
    const maxMonths = Math.max(...plans.map(plan => plan.data.schedule.length));
    const labels = Array.from({ length: Math.min(maxMonths, 12) }, (_, i) => 
      `${i + 1}${t('month')}`
    );

    return {
      labels,
      datasets: plans.map(plan => ({
        data: plan.data.schedule.slice(0, 12).map(item => item.payment),
        color: () => plan.color,
        strokeWidth: 2,
      })),
      legend: plans.map(plan => plan.name),
    };
  };

  // 计算总成本对比
  const getTotalCostComparison = () => {
    return plans.map(plan => ({
      ...plan,
      principal: plan.data.totalPayment - plan.data.totalInterest,
      interest: plan.data.totalInterest,
      total: plan.data.totalPayment,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('comparison.title')}</Text>

      {/* 月供对比图表 */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{t('comparison.monthlyPayment')}</Text>
        <LineChart
          data={getMonthlyPaymentData()}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* 总成本对比 */}
      <View style={styles.costComparison}>
        <Text style={styles.sectionTitle}>{t('comparison.totalCost')}</Text>
        {getTotalCostComparison().map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={styles.planCard}
            onPress={() => onSelectPlan?.(plan.id)}
          >
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.costBreakdown}>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>{t('comparison.principal')}</Text>
                <Text style={styles.costValue}>¥{plan.principal.toFixed(2)}</Text>
              </View>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>{t('comparison.interest')}</Text>
                <Text style={[styles.costValue, { color: theme.colors.secondary }]}>
                  ¥{plan.interest.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.costItem, styles.totalCost]}>
                <Text style={styles.costLabel}>{t('comparison.total')}</Text>
                <Text style={[styles.costValue, { color: theme.colors.primary }]}>
                  ¥{plan.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 关键指标对比 */}
      <View style={styles.metricsComparison}>
        <Text style={styles.sectionTitle}>{t('comparison.keyMetrics')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {plans.map(plan => (
            <View key={plan.id} style={styles.metricCard}>
              <Text style={[styles.metricTitle, { color: plan.color }]}>{plan.name}</Text>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('comparison.monthlyPayment')}</Text>
                <Text style={styles.metricValue}>¥{plan.data.monthlyPayment.toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('comparison.totalInterest')}</Text>
                <Text style={styles.metricValue}>¥{plan.data.totalInterest.toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('comparison.term')}</Text>
                <Text style={styles.metricValue}>
                  {Math.ceil(plan.data.schedule.length / 12)}{t('years')}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
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
  chartContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
  costComparison: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    ...theme.shadows.small,
  },
  planCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  costBreakdown: {
    gap: theme.spacing.sm,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  totalCost: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  metricsComparison: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    ...theme.shadows.small,
  },
  metricCard: {
    width: 200,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  metricItem: {
    marginBottom: theme.spacing.sm,
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
});

export default LoanPlanComparison; 