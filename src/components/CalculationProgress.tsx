import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface CalculationProgressProps {
  visible: boolean;
  progress?: number;
  message?: string;
}

const CalculationProgress: React.FC<CalculationProgressProps> = ({
  visible,
  progress,
  message,
}) => {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary}
          />
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
          )}
          <Text style={styles.message}>
            {message || t('calculation.progress')}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    minWidth: 200,
    ...theme.shadows.medium,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  message: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: 14,
  },
});

export default CalculationProgress; 