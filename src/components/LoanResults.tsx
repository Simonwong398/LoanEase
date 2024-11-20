import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoanResultsProps {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  visible: boolean;
}

const LoanResults: React.FC<LoanResultsProps> = ({
  monthlyPayment,
  totalPayment,
  totalInterest,
  visible,
}) => {
  const { t } = useLanguage();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.resultItem}>
        <Text style={styles.label}>{t('results.monthlyPayment')}</Text>
        <Text style={[styles.value, styles.monthlyPayment]}>
          ¥{monthlyPayment.toFixed(2)}
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.row}>
        <View style={[styles.resultItem, styles.halfWidth]}>
          <Text style={styles.label}>{t('results.totalPayment')}</Text>
          <Text style={styles.value}>¥{totalPayment.toFixed(2)}</Text>
        </View>

        <View style={[styles.resultItem, styles.halfWidth]}>
          <Text style={styles.label}>{t('results.totalInterest')}</Text>
          <Text style={[styles.value, styles.interestValue]}>
            ¥{totalInterest.toFixed(2)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  resultItem: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: 18,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  monthlyPayment: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  interestValue: {
    color: theme.colors.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});

export default LoanResults; 