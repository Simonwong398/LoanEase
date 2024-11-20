import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentMethod } from '../utils/loanCalculations';
import { precise } from '../utils/mathUtils';

interface PrepaymentAnalysisProps {
  originalLoan: {
    principal: number;
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    term: number;
  };
  prepaymentPlan: PaymentMethod;
  prepaymentAmount: number;
  prepaymentMonth: number;
  isReduceTerm: boolean;
}

const PrepaymentAnalysis: React.FC<PrepaymentAnalysisProps> = ({
  originalLoan,
  prepaymentPlan,
  prepaymentAmount,
  prepaymentMonth,
  isReduceTerm,
}) => {
  const { t } = useLanguage();

  // 计算节省的利息
  const savedInterest = precise.subtract(
    originalLoan.totalInterest,
    prepaymentPlan.totalInterest
  );

  // 计算减少的期限（如果是选择减少期限）
  const reducedMonths = isReduceTerm ? 
    originalLoan.term * 12 - prepaymentPlan.schedule.length : 0;

  // 计算新的月供（如果是选择减少月供）
  const monthlyPaymentReduction = !isReduceTerm ?
    precise.subtract(
      originalLoan.monthlyPayment,
      prepaymentPlan.schedule[prepaymentMonth].payment
    ) : 0;

  // 计算提前还款成本收益比
  const costBenefitRatio = precise.divide(savedInterest, prepaymentAmount);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('prepayment.analysis.title')}</Text>

      {/* 基本信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('prepayment.analysis.basic')}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t('prepayment.analysis.prepayAmount')}</Text>
          <Text style={styles.value}>¥{prepaymentAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('prepayment.analysis.prepayMonth')}</Text>
          <Text style={styles.value}>{prepaymentMonth} {t('months')}</Text>
        </View>
      </View>

      {/* 节省分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('prepayment.analysis.savings')}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t('prepayment.analysis.savedInterest')}</Text>
          <Text style={[styles.value, styles.highlight]}>
            ¥{savedInterest.toFixed(2)}
          </Text>
        </View>
        {isReduceTerm ? (
          <View style={styles.row}>
            <Text style={styles.label}>{t('prepayment.analysis.reducedMonths')}</Text>
            <Text style={[styles.value, styles.highlight]}>
              {reducedMonths} {t('months')}
            </Text>
          </View>
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>{t('prepayment.analysis.reducedPayment')}</Text>
            <Text style={[styles.value, styles.highlight]}>
              ¥{monthlyPaymentReduction.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* 成本效益分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('prepayment.analysis.costBenefit')}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t('prepayment.analysis.ratio')}</Text>
          <Text style={[styles.value, styles.highlight]}>
            {costBenefitRatio.toFixed(2)}
          </Text>
        </View>
        <Text style={styles.note}>
          {costBenefitRatio > 1 ? 
            t('prepayment.analysis.worthwhile') :
            t('prepayment.analysis.consider')}
        </Text>
      </View>

      {/* 建议 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('prepayment.analysis.suggestion')}</Text>
        <Text style={styles.suggestion}>
          {isReduceTerm ? 
            t('prepayment.analysis.termSuggestion', { months: reducedMonths }) :
            t('prepayment.analysis.paymentSuggestion', { amount: monthlyPaymentReduction.toFixed(2) })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  note: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  suggestion: {
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
});

export default PrepaymentAnalysis; 