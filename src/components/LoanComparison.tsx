import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoanPlan {
  type: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
}

interface LoanComparisonProps {
  plans: LoanPlan[];
}

const LoanComparison: React.FC<LoanComparisonProps> = ({ plans }) => {
  const { t } = useLanguage();

  return (
    <ScrollView horizontal style={styles.container}>
      {plans.map((plan, index) => (
        <View key={index} style={styles.planCard}>
          <Text style={styles.planType}>{t(`loanType.${plan.type}`)}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('input.amount')}</Text>
            <Text style={styles.value}>¥{plan.amount.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('input.rate')}</Text>
            <Text style={styles.value}>{plan.rate}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('results.monthlyPayment')}</Text>
            <Text style={styles.highlightValue}>¥{plan.monthlyPayment.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginVertical: theme.spacing.md,
  },
  planCard: {
    width: 280,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  planType: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text.secondary,
  },
  value: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  highlightValue: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoanComparison; 