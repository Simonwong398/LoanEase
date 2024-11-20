import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface ExportStage {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface ExportProgressDetailsProps {
  visible: boolean;
  stages: ExportStage[];
  currentStage: string;
  totalProgress: number;
  onClose?: () => void;
}

const ExportProgressDetails: React.FC<ExportProgressDetailsProps> = ({
  visible,
  stages,
  currentStage,
  totalProgress,
  onClose,
}) => {
  const { t } = useLanguage();

  const getStageIcon = (status: ExportStage['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      case 'processing':
        return '⋯';
      default:
        return '○';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('export.progress.title')}</Text>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${totalProgress * 100}%` }
              ]}
            />
          </View>
          
          <Text style={styles.percentage}>
            {Math.round(totalProgress * 100)}%
          </Text>

          <View style={styles.stagesList}>
            {stages.map(stage => (
              <View 
                key={stage.id}
                style={[
                  styles.stageItem,
                  currentStage === stage.id && styles.currentStage
                ]}
              >
                <Text style={styles.stageIcon}>
                  {getStageIcon(stage.status)}
                </Text>
                <View style={styles.stageInfo}>
                  <Text style={styles.stageName}>
                    {t(`export.stages.${stage.name}`)}
                  </Text>
                  {stage.status === 'processing' && (
                    <ActivityIndicator 
                      size="small"
                      color={theme.colors.primary}
                    />
                  )}
                  {stage.error && (
                    <Text style={styles.errorText}>{stage.error}</Text>
                  )}
                </View>
                {stage.status === 'completed' && (
                  <Text style={styles.completedText}>100%</Text>
                )}
              </View>
            ))}
          </View>

          {stages.some(stage => stage.status === 'error') && (
            <Text style={styles.retryHint}>
              {t('export.progress.retryHint')}
            </Text>
          )}
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
    width: '90%',
    maxWidth: 400,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  percentage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  stagesList: {
    gap: theme.spacing.md,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  currentStage: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  stageIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: theme.spacing.md,
    fontSize: 16,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  completedText: {
    fontSize: 12,
    color: theme.colors.success,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  retryHint: {
    fontSize: 12,
    color: theme.colors.text.hint,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
});

export default ExportProgressDetails; 