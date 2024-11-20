import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { cityPolicies } from '../config/cityPolicies';

interface PurchaseRestrictionAlertProps {
  cityId: string;
  loanType: string;
  onUnderstand: () => void;
}

const PurchaseRestrictionAlert: React.FC<PurchaseRestrictionAlertProps> = ({
  cityId,
  loanType,
  onUnderstand,
}) => {
  const { t } = useLanguage();
  const cityPolicy = cityPolicies[cityId];

  if (!cityPolicy?.purchaseRestrictions) {
    return null;
  }

  const isSecondHome = loanType === 'commercialSecondHouse';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('restrictions.title', { city: cityPolicy.name })}
      </Text>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {isSecondHome ? t('restrictions.secondHome') : t('restrictions.firstHome')}
        </Text>
        
        {cityPolicy.purchaseRestrictions.map((restriction, index) => (
          <Text key={index} style={styles.restrictionItem}>
            • {restriction}
          </Text>
        ))}

        <Text style={styles.warning}>
          {t('restrictions.warning')}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={onUnderstand}
      >
        <Text style={styles.buttonText}>
          {t('restrictions.understand')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  content: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
  },
  restrictionItem: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  warning: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PurchaseRestrictionAlert; 