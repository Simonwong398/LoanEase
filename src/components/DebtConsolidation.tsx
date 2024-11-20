import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import LoanParametersInput from './LoanParametersInput';

interface DebtItem {
  id: string;
  amount: string;
  rate: string;
  term: string;
  monthlyPayment: number;
}

const DebtConsolidation: React.FC = () => {
  const { t } = useLanguage();
  const [debts, setDebts] = useState<DebtItem[]>([]);
  
  const addDebt = () => {
    setDebts([...debts, {
      id: Date.now().toString(),
      amount: '',
      rate: '',
      term: '',
      monthlyPayment: 0
    }]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const updateDebt = (id: string, field: keyof DebtItem, value: string) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ));
  };

  const calculateTotalDebt = () => {
    return debts.reduce((total, debt) => total + (parseFloat(debt.amount) || 0), 0);
  };

  const calculateTotalMonthlyPayment = () => {
    return debts.reduce((total, debt) => total + (debt.monthlyPayment || 0), 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('debtConsolidation.title')}</Text>
      <ScrollView>
        {debts.map(debt => (
          <View key={debt.id} style={styles.debtItem}>
            <LoanParametersInput
              amount={debt.amount}
              rate={debt.rate}
              term={debt.term}
              onAmountChange={(value) => updateDebt(debt.id, 'amount', value)}
              onRateChange={(value) => updateDebt(debt.id, 'rate', value)}
              onTermChange={(value) => updateDebt(debt.id, 'term', value)}
            />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeDebt(debt.id)}
            >
              <Text style={styles.removeButtonText}>{t('debtConsolidation.remove')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.addButton} onPress={addDebt}>
        <Text style={styles.addButtonText}>{t('debtConsolidation.add')}</Text>
      </TouchableOpacity>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {t('debtConsolidation.totalDebt')}: ¥{calculateTotalDebt().toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          {t('debtConsolidation.totalMonthly')}: ¥{calculateTotalMonthlyPayment().toFixed(2)}
        </Text>
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
  debtItem: {
    marginBottom: theme.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  addButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  removeButtonText: {
    color: theme.colors.surface,
  },
  summary: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  summaryText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
});

export default DebtConsolidation; 