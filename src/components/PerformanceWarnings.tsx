import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { performanceWarningSystem } from '../utils/performanceWarningSystem';

interface PerformanceWarning {
  id: string;
  metric: string;
  level: 'warning' | 'critical';
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

const PerformanceWarnings: React.FC = () => {
  const { t } = useLanguage();
  const [warnings, setWarnings] = useState<PerformanceWarning[]>([]);

  useEffect(() => {
    const unsubscribe = performanceWarningSystem.subscribe(setWarnings);
    return unsubscribe;
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (warnings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('performance.warnings.title')}</Text>
      <ScrollView style={styles.warningsList}>
        {warnings.map(warning => (
          <View
            key={warning.id}
            style={[
              styles.warningItem,
              warning.level === 'critical' ? styles.criticalWarning : styles.normalWarning
            ]}
          >
            <View style={styles.warningHeader}>
              <Text style={styles.warningTime}>
                {formatTime(warning.timestamp)}
              </Text>
              <Text
                style={[
                  styles.warningLevel,
                  warning.level === 'critical' ? styles.criticalText : styles.warningText
                ]}
              >
                {warning.level === 'critical' ? '严重' : '警告'}
              </Text>
            </View>
            <Text style={styles.warningMessage}>{warning.message}</Text>
            <Text style={styles.warningDetail}>
              当前值: {warning.value.toFixed(2)} / 阈值: {warning.threshold.toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => performanceWarningSystem.clearWarnings()}
      >
        <Text style={styles.clearButtonText}>{t('performance.warnings.clear')}</Text>
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
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  warningsList: {
    maxHeight: 300,
  },
  warningItem: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
  },
  normalWarning: {
    backgroundColor: `${theme.colors.warning}10`,
    borderLeftColor: theme.colors.warning,
  },
  criticalWarning: {
    backgroundColor: `${theme.colors.error}10`,
    borderLeftColor: theme.colors.error,
  },
  warningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  warningTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  warningLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  warningText: {
    color: theme.colors.warning,
  },
  criticalText: {
    color: theme.colors.error,
  },
  warningMessage: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  warningDetail: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  clearButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  clearButtonText: {
    color: theme.colors.text.secondary,
  },
});

export default PerformanceWarnings; 