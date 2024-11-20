import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoanTip {
  title: string;
  description: string;
}

const LoanTips: React.FC = () => {
  const { t } = useLanguage();

  const tips: LoanTip[] = [
    {
      title: t('tips.downPayment.title'),
      description: t('tips.downPayment.description'),
    },
    {
      title: t('tips.interestRate.title'),
      description: t('tips.interestRate.description'),
    },
    {
      title: t('tips.term.title'),
      description: t('tips.term.description'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>{t('tips.title')}</Text>
      {tips.map((tip, index) => (
        <View key={index} style={styles.tipContainer}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  tipContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
  },
  tipDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default LoanTips; 