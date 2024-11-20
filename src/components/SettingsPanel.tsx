import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { settingsManager } from '../utils/settingsManager';
import { settingsSyncManager } from '../utils/settingsSyncManager';
import { UserSettings } from '../types/settings';
import RNPickerSelect from 'react-native-picker-select';

const SettingsPanel: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = React.useState<UserSettings>(settingsManager.getSettings());

  React.useEffect(() => {
    const unsubscribe = settingsManager.subscribe(setSettings);
    return unsubscribe;
  }, []);

  const handleCalculatorUpdate = async (updates: Partial<UserSettings['calculator']>) => {
    await settingsManager.updateCalculatorConfig(updates);
  };

  const handleUIUpdate = async (updates: Partial<UserSettings['ui']>) => {
    await settingsManager.updateUIPreferences(updates);
  };

  const handleSyncUpdate = async (updates: Partial<UserSettings['sync']>) => {
    await settingsManager.updateSyncConfig(updates);
    if (updates.syncEnabled !== undefined) {
      if (updates.syncEnabled) {
        await settingsSyncManager.enableSync();
      } else {
        await settingsSyncManager.disableSync();
      }
    }
  };

  const handleExportSettings = async () => {
    try {
      const settingsJson = await settingsManager.exportSettings();
      // 实现导出逻辑
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  const handleImportSettings = async () => {
    try {
      // 实现导入逻辑
      // const settingsJson = await showFilePicker();
      // await settingsManager.importSettings(settingsJson);
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 计算器设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.calculator.title')}</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.label}>{t('settings.calculator.defaultLoanType')}</Text>
          <RNPickerSelect
            value={settings.calculator.defaultLoanType}
            onValueChange={(value) => 
              handleCalculatorUpdate({ defaultLoanType: value })
            }
            items={[
              { label: t('loanType.commercialHouse.name'), value: 'commercialHouse' },
              { label: t('loanType.providentFund.name'), value: 'providentFund' },
            ]}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>{t('settings.calculator.defaultCity')}</Text>
          <RNPickerSelect
            value={settings.calculator.defaultCity}
            onValueChange={(value) => 
              handleCalculatorUpdate({ defaultCity: value })
            }
            items={[
              { label: '北京', value: 'beijing' },
              { label: '上海', value: 'shanghai' },
            ]}
            style={pickerSelectStyles}
          />
        </View>
      </View>

      {/* UI设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.ui.title')}</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.label}>{t('settings.ui.theme')}</Text>
          <RNPickerSelect
            value={settings.ui.theme}
            onValueChange={(value) => 
              handleUIUpdate({ theme: value })
            }
            items={[
              { label: t('settings.ui.theme.light'), value: 'light' },
              { label: t('settings.ui.theme.dark'), value: 'dark' },
              { label: t('settings.ui.theme.system'), value: 'system' },
            ]}
            style={pickerSelectStyles}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>{t('settings.ui.showChart')}</Text>
          <Switch
            value={settings.ui.showChart}
            onValueChange={(value) => handleUIUpdate({ showChart: value })}
          />
        </View>
      </View>

      {/* 同步设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.sync.title')}</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.label}>{t('settings.sync.enabled')}</Text>
          <Switch
            value={settings.sync.syncEnabled}
            onValueChange={(value) => handleSyncUpdate({ syncEnabled: value })}
          />
        </View>

        {settings.sync.syncEnabled && (
          <>
            <View style={styles.settingRow}>
              <Text style={styles.label}>{t('settings.sync.history')}</Text>
              <Switch
                value={settings.sync.syncItems.history}
                onValueChange={(value) => 
                  handleSyncUpdate({ 
                    syncItems: { ...settings.sync.syncItems, history: value } 
                  })
                }
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.label}>{t('settings.sync.settings')}</Text>
              <Switch
                value={settings.sync.syncItems.settings}
                onValueChange={(value) => 
                  handleSyncUpdate({ 
                    syncItems: { ...settings.sync.syncItems, settings: value } 
                  })
                }
              />
            </View>
          </>
        )}
      </View>

      {/* 导入导出 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.dataManagement')}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleExportSettings}
          >
            <Text style={styles.buttonText}>
              {t('settings.exportSettings')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleImportSettings}
          >
            <Text style={styles.buttonText}>
              {t('settings.importSettings')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 重置按钮 */}
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => settingsManager.resetSettings()}
      >
        <Text style={styles.resetButtonText}>
          {t('settings.resetAll')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
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
  resetButton: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    paddingRight: 30,
  },
});

export default SettingsPanel; 