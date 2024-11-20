import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useUserSettings } from '../hooks/useUserSettings';
import { loanTypes } from '../config/loanTypes';
import { cityPolicies } from '../config/cityPolicies';

interface ThemeOption {
  id: 'light' | 'dark' | 'system';
  name: string;
}

const SettingsScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { settings, updateSettings, resetSettings } = useUserSettings();

  const languages = [
    { id: 'zh', name: '中文' },
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
  ];

  const themes: ThemeOption[] = [
    { id: 'light', name: t('settings.theme.light') },
    { id: 'dark', name: t('settings.theme.dark') },
    { id: 'system', name: t('settings.theme.system') },
  ];

  const handleThemeChange = (themeId: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: themeId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.optionsContainer}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.option,
                language === lang.id && styles.selectedOption
              ]}
              onPress={() => setLanguage(lang.id)}
            >
              <Text style={[
                styles.optionText,
                language === lang.id && styles.selectedOptionText
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <View style={styles.optionsContainer}>
          {themes.map(themeOption => (
            <TouchableOpacity
              key={themeOption.id}
              style={[
                styles.option,
                settings.theme === themeOption.id && styles.selectedOption
              ]}
              onPress={() => handleThemeChange(themeOption.id)}
            >
              <Text style={[
                styles.optionText,
                settings.theme === themeOption.id && styles.selectedOptionText
              ]}>
                {themeOption.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.defaults')}</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.showChart')}</Text>
          <Switch
            value={settings.showChart}
            onValueChange={value => updateSettings({ showChart: value })}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.showSchedule')}</Text>
          <Switch
            value={settings.showSchedule}
            onValueChange={value => updateSettings({ showSchedule: value })}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.resetButton}
        onPress={resetSettings}
      >
        <Text style={styles.resetButtonText}>{t('settings.reset')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.text.primary,
  },
  selectedOptionText: {
    color: theme.colors.surface,
    fontWeight: '600',
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
  resetButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  resetButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 