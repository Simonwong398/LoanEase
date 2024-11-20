import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useLanguage } from '../i18n/LanguageContext';
import { theme } from '../theme/theme';
import { loanTypes } from '../config/loanTypes';

interface LoanTypeSelectorProps {
  selectedType: string;
  onValueChange: (value: string) => void;
}

const LoanTypeSelector: React.FC<LoanTypeSelectorProps> = ({ 
  selectedType,
  onValueChange 
}) => {
  const { t } = useLanguage();

  const loanTypeItems = Object.values(loanTypes).map(type => ({
    label: t(`loanType.${type.id}.name`),
    value: type.id,
  }));

  const selectedLoanType = loanTypes[selectedType];

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={onValueChange}
          items={loanTypeItems}
          value={selectedType}
          style={pickerSelectStyles}
          placeholder={{ label: t('loanType.placeholder'), value: null }}
        />
      </View>

      {selectedLoanType && (
        <View style={styles.infoContainer}>
          <Text style={styles.description}>
            {t(selectedLoanType.description)}
          </Text>
          <View style={styles.detailsContainer}>
            <DetailItem
              label={t('loanType.rate')}
              value={`${selectedLoanType.defaultRate}%`}
            />
            <DetailItem
              label={t('loanType.maxTerm')}
              value={`${selectedLoanType.maxTerm} ${t('years')}`}
            />
            <DetailItem
              label={t('loanType.amount')}
              value={`¥${selectedLoanType.minAmount.toLocaleString()} - ¥${selectedLoanType.maxAmount.toLocaleString()}`}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  pickerContainer: {
    padding: theme.spacing.md,
  },
  infoContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  detailsContainer: {
    marginTop: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
  },
});

export default LoanTypeSelector; 