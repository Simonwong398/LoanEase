"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const mathUtils_1 = require("../utils/mathUtils");
const PrepaymentAnalysis = ({ originalLoan, prepaymentPlan, prepaymentAmount, prepaymentMonth, isReduceTerm, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    // 计算节省的利息
    const savedInterest = mathUtils_1.precise.subtract(originalLoan.totalInterest, prepaymentPlan.totalInterest);
    // 计算减少的期限（如果是选择减少期限）
    const reducedMonths = isReduceTerm ?
        originalLoan.term * 12 - prepaymentPlan.schedule.length : 0;
    // 计算新的月供（如果是选择减少月供）
    const monthlyPaymentReduction = !isReduceTerm ?
        mathUtils_1.precise.subtract(originalLoan.monthlyPayment, prepaymentPlan.schedule[prepaymentMonth].payment) : 0;
    // 计算提前还款成本收益比
    const costBenefitRatio = mathUtils_1.precise.divide(savedInterest, prepaymentAmount);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('prepayment.analysis.title')}</react_native_1.Text>

      {/* 基本信息 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.analysis.basic')}</react_native_1.Text>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>{t('prepayment.analysis.prepayAmount')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{prepaymentAmount.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>{t('prepayment.analysis.prepayMonth')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>{prepaymentMonth} {t('months')}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      {/* 节省分析 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.analysis.savings')}</react_native_1.Text>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>{t('prepayment.analysis.savedInterest')}</react_native_1.Text>
          <react_native_1.Text style={[styles.value, styles.highlight]}>
            ¥{savedInterest.toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
        {isReduceTerm ? (<react_native_1.View style={styles.row}>
            <react_native_1.Text style={styles.label}>{t('prepayment.analysis.reducedMonths')}</react_native_1.Text>
            <react_native_1.Text style={[styles.value, styles.highlight]}>
              {reducedMonths} {t('months')}
            </react_native_1.Text>
          </react_native_1.View>) : (<react_native_1.View style={styles.row}>
            <react_native_1.Text style={styles.label}>{t('prepayment.analysis.reducedPayment')}</react_native_1.Text>
            <react_native_1.Text style={[styles.value, styles.highlight]}>
              ¥{monthlyPaymentReduction.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>)}
      </react_native_1.View>

      {/* 成本效益分析 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.analysis.costBenefit')}</react_native_1.Text>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.label}>{t('prepayment.analysis.ratio')}</react_native_1.Text>
          <react_native_1.Text style={[styles.value, styles.highlight]}>
            {costBenefitRatio.toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.Text style={styles.note}>
          {costBenefitRatio > 1 ?
            t('prepayment.analysis.worthwhile') :
            t('prepayment.analysis.consider')}
        </react_native_1.Text>
      </react_native_1.View>

      {/* 建议 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.analysis.suggestion')}</react_native_1.Text>
        <react_native_1.Text style={styles.suggestion}>
          {isReduceTerm ?
            t('prepayment.analysis.termSuggestion', { months: reducedMonths }) :
            t('prepayment.analysis.paymentSuggestion', { amount: monthlyPaymentReduction.toFixed(2) })}
        </react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg, margin: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
    section: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    value: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '500',
    },
    highlight: {
        color: theme_1.theme.colors.primary,
        fontWeight: '700',
    },
    note: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        marginTop: theme_1.theme.spacing.sm,
        fontStyle: 'italic',
    },
    suggestion: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        backgroundColor: `${theme_1.theme.colors.primary}10`,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderLeftWidth: 4,
        borderLeftColor: theme_1.theme.colors.primary,
    },
});
exports.default = PrepaymentAnalysis;
