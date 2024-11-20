import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { LoanCalculationError } from '../utils/errorHandling';

interface ErrorAlertProps {
  error: LoanCalculationError | null;
  onDismiss: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  const { t } = useLanguage();

  if (!error) return null;

  return (
    <Modal
      transparent
      visible={!!error}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('error.title')}</Text>
          <Text style={styles.message}>{error.message}</Text>
          {error.field && (
            <Text style={styles.field}>
              {t(`error.field.${error.field}`)}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.button}
            onPress={onDismiss}
          >
            <Text style={styles.buttonText}>{t('error.dismiss')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '80%',
    maxWidth: 400,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  field: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
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

export default ErrorAlert; 