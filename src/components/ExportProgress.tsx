import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface ExportProgressProps {
  progress: number;
  status: string;
  fileName?: string;
}

const ExportProgress: React.FC<ExportProgressProps> = ({
  progress,
  status,
  fileName,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('export.progress.title')}</Text>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` }
          ]}
        />
      </View>
      
      <Text style={styles.percentage}>
        {Math.round(progress * 100)}%
      </Text>
      
      <Text style={styles.status}>
        {t(`export.progress.${status}`)}
      </Text>
      
      {fileName && (
        <Text style={styles.fileName}>
          {fileName}
        </Text>
      )}
      
      {progress < 1 && (
        <ActivityIndicator 
          color={theme.colors.primary}
          style={styles.spinner}
        />
      )}
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  status: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  fileName: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spinner: {
    marginTop: theme.spacing.md,
  },
});

export default ExportProgress; 