import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentMethod } from '../utils/loanCalculations';
import { precise } from '../utils/mathUtils';

interface PrepaymentPlan {
  amount: number;
  month: number;
  isReduceTerm: boolean;
  result: PaymentMethod;
}

interface PrepaymentPlanComparisonProps {
  originalLoan: {
    principal: number;
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    term: number;
  };
  plans: PrepaymentPlan[];
}

const PrepaymentPlanComparison: React.FC<PrepaymentPlanComparisonProps> = ({
  originalLoan,
  plans,
}) => {
  const { t } = useLanguage();

  // 计算投资回报率 (ROI)
  const calculateROI = (plan: PrepaymentPlan) => {
    const savedInterest = precise.subtract(
      originalLoan.totalInterest,
      plan.result.totalInterest
    );
    return precise.multiply(
      precise.divide(savedInterest, plan.amount),
      100
    );
  };

  // 计算月供节省率
  const calculateMonthlySavingRate = (plan: PrepaymentPlan) => {
    if (!plan.isReduceTerm) {
      const monthlyReduction = precise.subtract(
        originalLoan.monthlyPayment,
        plan.result.monthlyPayment
      );
      return precise.multiply(
        precise.divide(monthlyReduction, originalLoan.monthlyPayment),
        100
      );
    }
    return 0;
  };

  // 计算提前还款压力指数
  const calculatePressureIndex = (plan: PrepaymentPlan) => {
    const monthlyIncomePressure = precise.divide(plan.amount, plan.month);
    const originalMonthlyPressure = originalLoan.monthlyPayment;
    return precise.divide(monthlyIncomePressure, originalMonthlyPressure);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('prepayment.comparison.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.plansContainer}>
          {/* 原始贷款信息 */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{t('prepayment.comparison.original')}</Text>
            <View style={styles.dataRow}>
              <Text style={styles.label}>{t('prepayment.comparison.monthlyPayment')}</Text>
              <Text style={styles.value}>¥{originalLoan.monthlyPayment.toFixed(2)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>{t('prepayment.comparison.totalInterest')}</Text>
              <Text style={styles.value}>¥{originalLoan.totalInterest.toFixed(2)}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>{t('prepayment.comparison.term')}</Text>
              <Text style={styles.value}>{originalLoan.term * 12} {t('months')}</Text>
            </View>
          </View>

          {/* 提前还款方案对比 */}
          {plans.map((plan, index) => (
            <View key={index} style={styles.planCard}>
              <Text style={styles.planTitle}>
                {t('prepayment.comparison.plan', { number: index + 1 })}
              </Text>
              
              {/* 基本信息 */}
              <View style={styles.dataRow}>
                <Text style={styles.label}>{t('prepayment.comparison.prepayAmount')}</Text>
                <Text style={styles.value}>¥{plan.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label}>{t('prepayment.comparison.prepayMonth')}</Text>
                <Text style={styles.value}>{plan.month}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label}>{t('prepayment.comparison.method')}</Text>
                <Text style={styles.value}>
                  {plan.isReduceTerm ? 
                    t('prepayment.reduceTerm') : 
                    t('prepayment.reducePayment')}
                </Text>
              </View>

              {/* 效果分析 */}
              <View style={styles.separator} />
              <View style={styles.dataRow}>
                <Text style={styles.label}>{t('prepayment.comparison.savedInterest')}</Text>
                <Text style={[styles.value, styles.highlight]}>
                  ¥{precise.subtract(originalLoan.totalInterest, plan.result.totalInterest).toFixed(2)}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label}>{t('prepayment.comparison.roi')}</Text>
                <Text style={[styles.value, styles.highlight]}>
                  {calculateROI(plan).toFixed(2)}%
                </Text>
              </View>
              {!plan.isReduceTerm && (
                <View style={styles.dataRow}>
                  <Text style={styles.label}>{t('prepayment.comparison.monthlySaving')}</Text>
                  <Text style={[styles.value, styles.highlight]}>
                    {calculateMonthlySavingRate(plan).toFixed(2)}%
                  </Text>
                </View>
              )}
              <View style={styles.dataRow}>
                <Text style={styles.label}>{t('prepayment.comparison.pressureIndex')}</Text>
                <Text style={[styles.value, styles.highlight]}>
                  {calculatePressureIndex(plan).toFixed(2)}
                </Text>
              </View>

              {/* 建议 */}
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionText}>
                  {calculatePressureIndex(plan) > 2 ? 
                    t('prepayment.comparison.highPressure') :
                    t('prepayment.comparison.reasonable')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  planCard: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  highlight: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  suggestionContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.sm,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default PrepaymentPlanComparison; 