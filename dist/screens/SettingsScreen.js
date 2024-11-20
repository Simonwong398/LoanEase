"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const useUserSettings_1 = require("../hooks/useUserSettings");
const SettingsScreen = () => {
    const { t, language, setLanguage } = (0, LanguageContext_1.useLanguage)();
    const { settings, updateSettings, resetSettings } = (0, useUserSettings_1.useUserSettings)();
    const languages = [
        { id: 'zh', name: '中文' },
        { id: 'en', name: 'English' },
        { id: 'es', name: 'Español' },
    ];
    const themes = [
        { id: 'light', name: t('settings.theme.light') },
        { id: 'dark', name: t('settings.theme.dark') },
        { id: 'system', name: t('settings.theme.system') },
    ];
    const handleThemeChange = (themeId) => {
        updateSettings({ theme: themeId });
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.language')}</react_native_1.Text>
        <react_native_1.View style={styles.optionsContainer}>
          {languages.map(lang => (<react_native_1.TouchableOpacity key={lang.id} style={[
                styles.option,
                language === lang.id && styles.selectedOption
            ]} onPress={() => setLanguage(lang.id)}>
              <react_native_1.Text style={[
                styles.optionText,
                language === lang.id && styles.selectedOptionText
            ]}>
                {lang.name}
              </react_native_1.Text>
            </react_native_1.TouchableOpacity>))}
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.theme')}</react_native_1.Text>
        <react_native_1.View style={styles.optionsContainer}>
          {themes.map(themeOption => (<react_native_1.TouchableOpacity key={themeOption.id} style={[
                styles.option,
                settings.theme === themeOption.id && styles.selectedOption
            ]} onPress={() => handleThemeChange(themeOption.id)}>
              <react_native_1.Text style={[
                styles.optionText,
                settings.theme === themeOption.id && styles.selectedOptionText
            ]}>
                {themeOption.name}
              </react_native_1.Text>
            </react_native_1.TouchableOpacity>))}
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.defaults')}</react_native_1.Text>
        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.settingLabel}>{t('settings.showChart')}</react_native_1.Text>
          <react_native_1.Switch value={settings.showChart} onValueChange={value => updateSettings({ showChart: value })} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
        </react_native_1.View>
        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.settingLabel}>{t('settings.showSchedule')}</react_native_1.Text>
          <react_native_1.Switch value={settings.showSchedule} onValueChange={value => updateSettings({ showSchedule: value })} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
        <react_native_1.Text style={styles.resetButtonText}>{t('settings.reset')}</react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.background,
        padding: theme_1.theme.spacing.md,
    },
    section: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md, marginBottom: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme_1.theme.spacing.sm,
    },
    option: {
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
    },
    selectedOption: {
        backgroundColor: theme_1.theme.colors.primary,
        borderColor: theme_1.theme.colors.primary,
    },
    optionText: {
        color: theme_1.theme.colors.text.primary,
    },
    selectedOptionText: {
        color: theme_1.theme.colors.surface,
        fontWeight: '600',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme_1.theme.spacing.sm,
    },
    settingLabel: {
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
    },
    resetButton: {
        backgroundColor: theme_1.theme.colors.error,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.lg,
    },
    resetButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = SettingsScreen;
