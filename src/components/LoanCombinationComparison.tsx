import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { calculateCombinedLoan } from '../utils/loanCalculations';

interface CombinationPlan {
  commercial: number;
  providentFund: number;
  totalAmount: number;
  monthlyPayment: number;
  totalInterest: number;
}

const LoanCombinationComparison: React.FC<{
  totalAmount: number;
  commercialRate: number;
  providentFundRate: number;
  term: number;
}> = ({ totalAmount, commercialRate, providentFundRate, term }) => {
  const { t } = useLanguage();

  // 生成不同比例的组合方案
  const generatePlans = (): CombinationPlan[] => {
    const plans: CombinationPlan[] = [];
    // 从0%到100%，每次增加20%的公积金比例
    for (let providentFundRatio = 0; providentFundRatio <= 1; providentFundRatio += 0.2) {
      const providentFundAmount = totalAmount * providentFundRatio;
      const commercialAmount = totalAmount - providentFundAmount;

      const result = calculateCombinedLoan(
        {
          amount: commercialAmount,
          rate: commercialRate,
        },
        {
          amount: providentFundAmount,
          rate: providentFundRate,
        },
        term
      );

      plans.push({
        commercial: commercialAmount,
        providentFund: providentFundAmount,
        totalAmount,
        monthlyPayment: result.combined.monthlyPayment,
        totalInterest: result.combined.totalInterest,
      });
    }
    return plans;
  };

  const plans = generatePlans();
  const bestPlan = plans.reduce((prev, current) => 
    current.totalInterest < prev.totalInterest ? current : prev
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('combinationComparison.title')}</Text>

      <ScrollView>
        {plans.map((plan, index) => (
          <View 
            key={index} 
            style={[
              styles.planCard,
              plan === bestPlan && styles.bestPlan
            ]}
          >
            <View style={styles.ratioBar}>
              <View 
                style={[
                  styles.commercialRatio, 
                  { flex: plan.commercial / plan.totalAmount }
                ]} 
              />
              <View 
                style={[
                  styles.providentFundRatio,
                  { flex: plan.providentFund / plan.totalAmount }
                ]}
              />
            </View>

            <View style={styles.planDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>{t('combinationComparison.commercial')}</Text>
                <Text style={styles.value}>
                  ¥{plan.commercial.toFixed(0)} ({(plan.commercial / plan.totalAmount * 100).toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>{t('combinationComparison.providentFund')}</Text>
                <Text style={styles.value}>
                  ¥{plan.providentFund.toFixed(0)} ({(plan.providentFund / plan.totalAmount * 100).toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>{t('combinationComparison.monthlyPayment')}</Text>
                <Text style={styles.value}>¥{plan.monthlyPayment.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>{t('combinationComparison.totalInterest')}</Text>
                <Text style={[
                  styles.value,
                  plan === bestPlan && styles.bestValue
                ]}>
                  ¥{plan.totalInterest.toFixed(2)}
                </Text>
              </View>
            </View>

            {plan === bestPlan && (
              <View style={styles.bestPlanBadge}>
                <Text style={styles.bestPlanText}>
                  {t('combinationComparison.bestPlan')}
                </Text>
              </View>
            )}
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
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  planCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bestPlan: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  ratioBar: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  commercialRatio: {
    backgroundColor: theme.colors.primary,
  },
  providentFundRatio: {
    backgroundColor: theme.colors.secondary,
  },
  planDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bestValue: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  bestPlanBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  bestPlanText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoanCombinationComparison; 