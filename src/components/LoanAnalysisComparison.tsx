import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentMethod } from '../utils/loanCalculations';

interface LoanAnalysisComparisonProps {
  equalPayment: PaymentMethod;
  equalPrincipal: PaymentMethod;
}

interface YearlyAnalysis {
  year: number;
  equalPayment: number;
  equalPrincipal: number;
  difference: number;
}

const LoanAnalysisComparison: React.FC<LoanAnalysisComparisonProps> = ({
  equalPayment,
  equalPrincipal,
}) => {
  const { t } = useLanguage();

  // 计算关键指标的差异
  const differences = {
    totalInterest: equalPayment.totalInterest - equalPrincipal.totalInterest,
    firstPayment: equalPayment.monthlyPayment - equalPrincipal.schedule[0].payment,
    lastPayment: equalPayment.monthlyPayment - equalPrincipal.schedule[equalPrincipal.schedule.length - 1].payment,
    averagePayment: equalPayment.monthlyPayment - 
      (equalPrincipal.totalPayment / equalPrincipal.schedule.length),
  };

  // 计算每年的还款情况
  const getYearlyAnalysis = (): YearlyAnalysis[] => {
    const yearlyData: YearlyAnalysis[] = [];
    for (let year = 0; year < equalPrincipal.schedule.length / 12; year++) {
      const yearStart = year * 12;
      const equalPaymentYearTotal = equalPayment.monthlyPayment * 12;
      const equalPrincipalYearTotal = equalPrincipal.schedule
        .slice(yearStart, yearStart + 12)
        .reduce((sum, item) => sum + item.payment, 0);

      yearlyData.push({
        year: year + 1,
        equalPayment: equalPaymentYearTotal,
        equalPrincipal: equalPrincipalYearTotal,
        difference: equalPaymentYearTotal - equalPrincipalYearTotal,
      });
    }
    return yearlyData;
  };

  const yearlyAnalysis = getYearlyAnalysis();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analysis.title')}</Text>

      {/* 总体对比 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.overview')}</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.label}>{t('analysis.totalInterest')}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              等额本息: ¥{equalPayment.totalInterest.toFixed(2)}
            </Text>
            <Text style={styles.value}>
              等额本金: ¥{equalPrincipal.totalInterest.toFixed(2)}
            </Text>
            <Text style={[styles.difference, { color: differences.totalInterest > 0 ? theme.colors.error : theme.colors.success }]}>
              差额: ¥{Math.abs(differences.totalInterest).toFixed(2)}
              {differences.totalInterest > 0 ? ' 多' : ' 少'}
            </Text>
          </View>
        </View>
      </View>

      {/* 月供变化分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.monthlyPayment')}</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.label}>{t('analysis.firstMonth')}</Text>
          <Text style={styles.value}>¥{equalPrincipal.schedule[0].payment.toFixed(2)}</Text>
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.label}>{t('analysis.lastMonth')}</Text>
          <Text style={styles.value}>
            ¥{equalPrincipal.schedule[equalPrincipal.schedule.length - 1].payment.toFixed(2)}
          </Text>
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.label}>{t('analysis.monthlyFixed')}</Text>
          <Text style={styles.value}>¥{equalPayment.monthlyPayment.toFixed(2)}</Text>
        </View>
      </View>

      {/* 年度还款分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('analysis.yearlyComparison')}</Text>
        <ScrollView style={styles.yearlyTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>{t('analysis.year')}</Text>
            <Text style={styles.headerCell}>{t('analysis.equalPayment')}</Text>
            <Text style={styles.headerCell}>{t('analysis.equalPrincipal')}</Text>
            <Text style={styles.headerCell}>{t('analysis.difference')}</Text>
          </View>
          {yearlyAnalysis.map((year) => (
            <View key={year.year} style={styles.tableRow}>
              <Text style={styles.cell}>{year.year}</Text>
              <Text style={styles.cell}>¥{year.equalPayment.toFixed(0)}</Text>
              <Text style={styles.cell}>¥{year.equalPrincipal.toFixed(0)}</Text>
              <Text style={[styles.cell, { color: year.difference > 0 ? theme.colors.error : theme.colors.success }]}>
                ¥{Math.abs(year.difference).toFixed(0)}
              </Text>
            </View>
          ))}
        </ScrollView>
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  valueContainer: {
    flex: 2,
  },
  value: {
    fontSize: 14,
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  difference: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  yearlyTable: {
    maxHeight: 200,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: theme.spacing.sm,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default LoanAnalysisComparison; 