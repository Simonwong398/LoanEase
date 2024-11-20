import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoanParametersInputProps {
  amount: string;
  rate: string;
  term: string;
  onAmountChange: (value: string) => void;
  onRateChange: (value: string) => void;
  onTermChange: (value: string) => void;
  showAmount?: boolean;
  showRate?: boolean;
  showTerm?: boolean;
  amountLabel?: string;
  rateLabel?: string;
  termLabel?: string;
}

const LoanParametersInput: React.FC<LoanParametersInputProps> = ({
  amount,
  rate,
  term,
  onAmountChange,
  onRateChange,
  onTermChange,
  showAmount = true,
  showRate = true,
  showTerm = true,
  amountLabel,
  rateLabel,
  termLabel,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {showAmount && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{amountLabel || t('input.amount')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            placeholder={t('input.amountPlaceholder')}
            placeholderTextColor={theme.colors.text.hint}
          />
        </View>
      )}

      {showRate && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{rateLabel || t('input.rate')}</Text>
          <TextInput
            style={styles.input}
            value={rate}
            onChangeText={onRateChange}
            keyboardType="numeric"
            placeholder={t('input.ratePlaceholder')}
            placeholderTextColor={theme.colors.text.hint}
          />
        </View>
      )}

      {showTerm && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{termLabel || t('input.term')}</Text>
          <TextInput
            style={styles.input}
            value={term}
            onChangeText={onTermChange}
            keyboardType="numeric"
            placeholder={t('input.termPlaceholder')}
            placeholderTextColor={theme.colors.text.hint}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    ...theme.shadows.small,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
  },
});

export default LoanParametersInput; 