import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useLPRRate } from '../services/lprService';

const LPRDisplay: React.FC = () => {
  const { t } = useLanguage();
  const { lprData, loading, error } = useLPRRate();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('lpr.currentRate')}</Text>
      <View style={styles.rateContainer}>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>{t('lpr.oneYear')}</Text>
          <Text style={styles.rateValue}>{lprData?.oneYear}%</Text>
        </View>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>{t('lpr.fiveYear')}</Text>
          <Text style={styles.rateValue}>{lprData?.fiveYear}%</Text>
        </View>
      </View>
      <Text style={styles.updateTime}>
        {t('lpr.lastUpdate')}: {new Date(lprData?.date || '').toLocaleDateString()}
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  rateItem: {
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  updateTime: {
    fontSize: 12,
    color: theme.colors.text.hint,
    textAlign: 'right',
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default LPRDisplay; 