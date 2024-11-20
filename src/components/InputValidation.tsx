import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface InputValidationProps {
  value: string;
  rules: ValidationRule[];
  fieldName: string;
  showValidation: boolean;
}

const InputValidation: React.FC<InputValidationProps> = ({
  value,
  rules,
  fieldName,
  showValidation,
}) => {
  const { t } = useLanguage();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (showValidation) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showValidation]);

  const validationResults = rules.map(rule => ({
    valid: rule.test(value),
    message: rule.message,
  }));

  const isValid = validationResults.every(result => result.valid);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {showValidation && (
        <>
          <Text style={styles.fieldName}>
            {t(`validation.${fieldName}.title`)}
          </Text>
          {validationResults.map((result, index) => (
            <View key={index} style={styles.validationItem}>
              <View style={[
                styles.indicator,
                result.valid ? styles.validIndicator : styles.invalidIndicator
              ]} />
              <Text style={[
                styles.message,
                result.valid ? styles.validMessage : styles.invalidMessage
              ]}>
                {t(result.message)}
              </Text>
            </View>
          ))}
          {isValid && (
            <Text style={styles.successMessage}>
              {t(`validation.${fieldName}.valid`)}
            </Text>
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  validIndicator: {
    backgroundColor: theme.colors.success,
  },
  invalidIndicator: {
    backgroundColor: theme.colors.error,
  },
  message: {
    fontSize: 12,
  },
  validMessage: {
    color: theme.colors.text.secondary,
  },
  invalidMessage: {
    color: theme.colors.error,
  },
  successMessage: {
    fontSize: 12,
    color: theme.colors.success,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
});

export default InputValidation; 