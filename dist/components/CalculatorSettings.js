"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const CalculatorSettings = ({ showChart, showSchedule, onShowChartChange, onShowScheduleChange, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('settings.title')}</react_native_1.Text>
      
      <react_native_1.View style={styles.settingRow}>
        <react_native_1.Text style={styles.settingLabel}>{t('settings.showChart')}</react_native_1.Text>
        <react_native_1.Switch value={showChart} onValueChange={onShowChartChange} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
      </react_native_1.View>

      <react_native_1.View style={styles.settingRow}>
        <react_native_1.Text style={styles.settingLabel}>{t('settings.showSchedule')}</react_native_1.Text>
        <react_native_1.Switch value={showSchedule} onValueChange={onShowScheduleChange} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
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
});
exports.default = CalculatorSettings;
