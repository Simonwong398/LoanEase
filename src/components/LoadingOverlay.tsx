import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  progress,
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
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
          <Text style={styles.message}>
            {message || t('loading.default')}
          </Text>
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
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 200,
    ...theme.shadows.medium,
  },
  progressContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  message: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoadingOverlay; 