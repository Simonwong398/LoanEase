"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const lprService_1 = require("../services/lprService");
const LPRDisplay = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const { lprData, loading, error } = (0, lprService_1.useLPRRate)();
    if (loading) {
        return (<react_native_1.View style={styles.container}>
        <react_native_1.ActivityIndicator color={theme_1.theme.colors.primary}/>
      </react_native_1.View>);
    }
    if (error) {
        return (<react_native_1.View style={styles.container}>
        <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
      </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('lpr.currentRate')}</react_native_1.Text>
      <react_native_1.View style={styles.rateContainer}>
        <react_native_1.View style={styles.rateItem}>
          <react_native_1.Text style={styles.rateLabel}>{t('lpr.oneYear')}</react_native_1.Text>
          <react_native_1.Text style={styles.rateValue}>{lprData === null || lprData === void 0 ? void 0 : lprData.oneYear}%</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.rateItem}>
          <react_native_1.Text style={styles.rateLabel}>{t('lpr.fiveYear')}</react_native_1.Text>
          <react_native_1.Text style={styles.rateValue}>{lprData === null || lprData === void 0 ? void 0 : lprData.fiveYear}%</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
      <react_native_1.Text style={styles.updateTime}>
        {t('lpr.lastUpdate')}: {new Date((lprData === null || lprData === void 0 ? void 0 : lprData.date) || '').toLocaleDateString()}
      </react_native_1.Text>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    rateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme_1.theme.spacing.md,
    },
    rateItem: {
        alignItems: 'center',
    },
    rateLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    rateValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme_1.theme.colors.primary,
    },
    updateTime: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        textAlign: 'right',
    },
    errorText: {
        color: theme_1.theme.colors.error,
        textAlign: 'center',
    },
});
exports.default = LPRDisplay;
