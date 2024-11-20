import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentScheduleItem } from '../utils/loanCalculations';

interface DetailedRepaymentScheduleProps {
  schedule: PaymentScheduleItem[];
  totalAmount: number;
  totalInterest: number;
}

const DetailedRepaymentSchedule: React.FC<DetailedRepaymentScheduleProps> = ({
  schedule,
  totalAmount,
  totalInterest,
}) => {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const yearsCount = Math.ceil(schedule.length / 12);

  const getYearlyStats = (year: number) => {
    const startIndex = (year - 1) * 12;
    const yearlyPayments = schedule.slice(startIndex, startIndex + 12);
    
    return {
      totalPayment: yearlyPayments.reduce((sum, item) => sum + item.payment, 0),
      totalPrincipal: yearlyPayments.reduce((sum, item) => sum + item.principal, 0),
      totalInterest: yearlyPayments.reduce((sum, item) => sum + item.interest, 0),
      remainingBalance: yearlyPayments[yearlyPayments.length - 1].remainingBalance,
      completionRate: (1 - yearlyPayments[yearlyPayments.length - 1].remainingBalance / totalAmount) * 100
    };
  };

  const yearlyStats = getYearlyStats(selectedYear);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('repaymentSchedule.title')}</Text>

      {/* 年份选择器 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearSelector}>
        {Array.from({ length: yearsCount }, (_, i) => i + 1).map(year => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.selectedYear
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text style={[
              styles.yearText,
              selectedYear === year && styles.selectedYearText
            ]}>
              {t('repaymentSchedule.year', { year })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 年度统计 */}
      <View style={styles.yearlyStats}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t('repaymentSchedule.yearlyPayment')}</Text>
          <Text style={styles.statValue}>¥{yearlyStats.totalPayment.toFixed(2)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t('repaymentSchedule.yearlyPrincipal')}</Text>
          <Text style={styles.statValue}>¥{yearlyStats.totalPrincipal.toFixed(2)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t('repaymentSchedule.yearlyInterest')}</Text>
          <Text style={styles.statValue}>¥{yearlyStats.totalInterest.toFixed(2)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t('repaymentSchedule.completionRate')}</Text>
          <Text style={styles.statValue}>{yearlyStats.completionRate.toFixed(2)}%</Text>
        </View>
      </View>

      {/* 月度明细 */}
      <ScrollView style={styles.monthlyDetails}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>{t('repaymentSchedule.month')}</Text>
          <Text style={styles.headerCell}>{t('repaymentSchedule.payment')}</Text>
          <Text style={styles.headerCell}>{t('repaymentSchedule.principal')}</Text>
          <Text style={styles.headerCell}>{t('repaymentSchedule.interest')}</Text>
          <Text style={styles.headerCell}>{t('repaymentSchedule.remaining')}</Text>
        </View>
        {schedule
          .slice((selectedYear - 1) * 12, selectedYear * 12)
          .map((item, index) => (
            <View key={item.month} style={styles.tableRow}>
              <Text style={styles.cell}>{item.month}</Text>
              <Text style={styles.cell}>¥{item.payment.toFixed(2)}</Text>
              <Text style={styles.cell}>¥{item.principal.toFixed(2)}</Text>
              <Text style={styles.cell}>¥{item.interest.toFixed(2)}</Text>
              <Text style={styles.cell}>¥{item.remainingBalance.toFixed(2)}</Text>
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
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  yearSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  yearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  selectedYear: {
    backgroundColor: theme.colors.primary,
  },
  yearText: {
    color: theme.colors.text.primary,
  },
  selectedYearText: {
    color: theme.colors.surface,
  },
  yearlyStats: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  monthlyDetails: {
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
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
    paddingVertical: theme.spacing.sm,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default DetailedRepaymentSchedule; 