import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface CalculatorSettingsProps {
  showChart: boolean;
  showSchedule: boolean;
  onShowChartChange: (value: boolean) => void;
  onShowScheduleChange: (value: boolean) => void;
}

const CalculatorSettings: React.FC<CalculatorSettingsProps> = ({
  showChart,
  showSchedule,
  onShowChartChange,
  onShowScheduleChange,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>{t('settings.showChart')}</Text>
        <Switch
          value={showChart}
          onValueChange={onShowChartChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>{t('settings.showSchedule')}</Text>
        <Switch
          value={showSchedule}
          onValueChange={onShowScheduleChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
      </View>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});

export default CalculatorSettings; 