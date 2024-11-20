"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanTips = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const tips = [
        {
            title: t('tips.downPayment.title'),
            description: t('tips.downPayment.description'),
        },
        {
            title: t('tips.interestRate.title'),
            description: t('tips.interestRate.description'),
        },
        {
            title: t('tips.term.title'),
            description: t('tips.term.description'),
        },
    ];
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.mainTitle}>{t('tips.title')}</react_native_1.Text>
      {tips.map((tip, index) => (<react_native_1.View key={index} style={styles.tipContainer}>
          <react_native_1.Text style={styles.tipTitle}>{tip.title}</react_native_1.Text>
          <react_native_1.Text style={styles.tipDescription}>{tip.description}</react_native_1.Text>
        </react_native_1.View>))}
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        margin: theme_1.theme.spacing.md,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    tipContainer: Object.assign({ backgroundColor: theme_1.theme.colors.surface, padding: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md, marginBottom: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.primary,
    },
    tipDescription: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
});
exports.default = LoanTips;
