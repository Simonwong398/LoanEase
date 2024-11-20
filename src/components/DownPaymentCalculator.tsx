import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { cityPolicies } from '../config/cityPolicies';

interface DownPaymentCalculatorProps {
  totalPrice: string;
  cityId: string;
  loanType: string;
  onDownPaymentChange: (downPayment: number) => void;
  onLoanAmountChange: (loanAmount: number) => void;
}

const DownPaymentCalculator: React.FC<DownPaymentCalculatorProps> = ({
  totalPrice,
  cityId,
  loanType,
  onDownPaymentChange,
  onLoanAmountChange,
}) => {
  const { t } = useLanguage();
  const [downPaymentRate, setDownPaymentRate] = useState<number>(0);
  const [downPaymentAmount, setDownPaymentAmount] = useState<string>('');

  useEffect(() => {
    const cityPolicy = cityPolicies[cityId];
    if (cityPolicy && loanType) {
      // 根据贷款类型设置首付比例
      const rate = loanType === 'commercialSecondHouse' 
        ? cityPolicy.restrictions.secondHome.downPayment 
        : cityPolicy.restrictions.firstHome.downPayment;
      setDownPaymentRate(rate);
    }
  }, [cityId, loanType]);

  useEffect(() => {
    const price = parseFloat(totalPrice) || 0;
    const calculatedDownPayment = price * (downPaymentRate / 100);
    const loanAmount = price - calculatedDownPayment;
    
    setDownPaymentAmount(calculatedDownPayment.toFixed(2));
    onDownPaymentChange(calculatedDownPayment);
    onLoanAmountChange(loanAmount);
  }, [totalPrice, downPaymentRate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('downPayment.title')}</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>{t('downPayment.totalPrice')}</Text>
        <TextInput
          style={styles.input}
          value={totalPrice}
          keyboardType="numeric"
          editable={false}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('downPayment.rate')}</Text>
        <Text style={styles.value}>{downPaymentRate}%</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('downPayment.amount')}</Text>
        <Text style={styles.value}>¥{downPaymentAmount}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('downPayment.loanAmount')}</Text>
        <Text style={styles.value}>
          ¥{(parseFloat(totalPrice) - parseFloat(downPaymentAmount)).toFixed(2)}
        </Text>
      </View>

      <Text style={styles.note}>
        {t('downPayment.note')}
      </Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    width: '50%',
    textAlign: 'right',
  },
  note: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
});

export default DownPaymentCalculator; 