"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanComparison = ({ plans }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    return (<react_native_1.ScrollView horizontal style={styles.container}>
      {plans.map((plan, index) => (<react_native_1.View key={index} style={styles.planCard}>
          <react_native_1.Text style={styles.planType}>{t(`loanType.${plan.type}`)}</react_native_1.Text>
          <react_native_1.View style={styles.detailRow}>
            <react_native_1.Text style={styles.label}>{t('input.amount')}</react_native_1.Text>
            <react_native_1.Text style={styles.value}>¥{plan.amount.toFixed(2)}</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.detailRow}>
            <react_native_1.Text style={styles.label}>{t('input.rate')}</react_native_1.Text>
            <react_native_1.Text style={styles.value}>{plan.rate}%</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.detailRow}>
            <react_native_1.Text style={styles.label}>{t('results.monthlyPayment')}</react_native_1.Text>
            <react_native_1.Text style={styles.highlightValue}>¥{plan.monthlyPayment.toFixed(2)}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>))}
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flexGrow: 0,
        marginVertical: theme_1.theme.spacing.md,
    },
    planCard: Object.assign({ width: 280, padding: theme_1.theme.spacing.md, marginHorizontal: theme_1.theme.spacing.sm, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    planType: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.primary,
        marginBottom: theme_1.theme.spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    label: {
        color: theme_1.theme.colors.text.secondary,
    },
    value: {
        color: theme_1.theme.colors.text.primary,
        fontWeight: '500',
    },
    highlightValue: {
        color: theme_1.theme.colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
});
exports.default = LoanComparison;
