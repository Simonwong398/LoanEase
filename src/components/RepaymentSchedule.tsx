import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface PaymentDetail {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface RepaymentScheduleProps {
  loanAmount: number;
  monthlyPayment: number;
  annualRate: number;
  termInYears: number;
}

const RepaymentSchedule: React.FC<RepaymentScheduleProps> = ({
  loanAmount,
  monthlyPayment,
  annualRate,
  termInYears,
}) => {
  const { t } = useLanguage();
  
  const calculateSchedule = (): PaymentDetail[] => {
    const schedule: PaymentDetail[] = [];
    let balance = loanAmount;
    const monthlyRate = annualRate / 12 / 100;
    
    for (let month = 1; month <= termInYears * 12; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal,
        interest,
        remainingBalance: Math.max(0, balance),
      });
    }
    
    return schedule;
  };

  const renderItem = ({ item }: { item: PaymentDetail }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.month}</Text>
      <Text style={styles.cell}>¥{item.payment.toFixed(2)}</Text>
      <Text style={styles.cell}>¥{item.principal.toFixed(2)}</Text>
      <Text style={styles.cell}>¥{item.interest.toFixed(2)}</Text>
      <Text style={styles.cell}>¥{item.remainingBalance.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('schedule.title')}</Text>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>{t('schedule.month')}</Text>
        <Text style={styles.headerCell}>{t('schedule.payment')}</Text>
        <Text style={styles.headerCell}>{t('schedule.principal')}</Text>
        <Text style={styles.headerCell}>{t('schedule.interest')}</Text>
        <Text style={styles.headerCell}>{t('schedule.balance')}</Text>
      </View>
      <FlatList
        data={calculateSchedule()}
        renderItem={renderItem}
        keyExtractor={(item) => item.month.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    padding: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
  },
  headerCell: {
    flex: 1,
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
});

export default RepaymentSchedule; 