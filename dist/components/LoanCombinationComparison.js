"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const loanCalculations_1 = require("../utils/loanCalculations");
const LoanCombinationComparison = ({ totalAmount, commercialRate, providentFundRate, term }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    // 生成不同比例的组合方案
    const generatePlans = () => {
        const plans = [];
        // 从0%到100%，每次增加20%的公积金比例
        for (let providentFundRatio = 0; providentFundRatio <= 1; providentFundRatio += 0.2) {
            const providentFundAmount = totalAmount * providentFundRatio;
            const commercialAmount = totalAmount - providentFundAmount;
            const result = (0, loanCalculations_1.calculateCombinedLoan)({
                amount: commercialAmount,
                rate: commercialRate,
            }, {
                amount: providentFundAmount,
                rate: providentFundRate,
            }, term);
            plans.push({
                commercial: commercialAmount,
                providentFund: providentFundAmount,
                totalAmount,
                monthlyPayment: result.combined.monthlyPayment,
                totalInterest: result.combined.totalInterest,
            });
        }
        return plans;
    };
    const plans = generatePlans();
    const bestPlan = plans.reduce((prev, current) => current.totalInterest < prev.totalInterest ? current : prev);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('combinationComparison.title')}</react_native_1.Text>

      <react_native_1.ScrollView>
        {plans.map((plan, index) => (<react_native_1.View key={index} style={[
                styles.planCard,
                plan === bestPlan && styles.bestPlan
            ]}>
            <react_native_1.View style={styles.ratioBar}>
              <react_native_1.View style={[
                styles.commercialRatio,
                { flex: plan.commercial / plan.totalAmount }
            ]}/>
              <react_native_1.View style={[
                styles.providentFundRatio,
                { flex: plan.providentFund / plan.totalAmount }
            ]}/>
            </react_native_1.View>

            <react_native_1.View style={styles.planDetails}>
              <react_native_1.View style={styles.detailRow}>
                <react_native_1.Text style={styles.label}>{t('combinationComparison.commercial')}</react_native_1.Text>
                <react_native_1.Text style={styles.value}>
                  ¥{plan.commercial.toFixed(0)} ({(plan.commercial / plan.totalAmount * 100).toFixed(0)}%)
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.detailRow}>
                <react_native_1.Text style={styles.label}>{t('combinationComparison.providentFund')}</react_native_1.Text>
                <react_native_1.Text style={styles.value}>
                  ¥{plan.providentFund.toFixed(0)} ({(plan.providentFund / plan.totalAmount * 100).toFixed(0)}%)
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.detailRow}>
                <react_native_1.Text style={styles.label}>{t('combinationComparison.monthlyPayment')}</react_native_1.Text>
                <react_native_1.Text style={styles.value}>¥{plan.monthlyPayment.toFixed(2)}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.detailRow}>
                <react_native_1.Text style={styles.label}>{t('combinationComparison.totalInterest')}</react_native_1.Text>
                <react_native_1.Text style={[
                styles.value,
                plan === bestPlan && styles.bestValue
            ]}>
                  ¥{plan.totalInterest.toFixed(2)}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>

            {plan === bestPlan && (<react_native_1.View style={styles.bestPlanBadge}>
                <react_native_1.Text style={styles.bestPlanText}>
                  {t('combinationComparison.bestPlan')}
                </react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.View>))}
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
    },
    planCard: {
        marginBottom: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
    },
    bestPlan: {
        borderColor: theme_1.theme.colors.primary,
        backgroundColor: `${theme_1.theme.colors.primary}10`,
    },
    ratioBar: {
        height: 8,
        flexDirection: 'row',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: theme_1.theme.spacing.md,
    },
    commercialRatio: {
        backgroundColor: theme_1.theme.colors.primary,
    },
    providentFundRatio: {
        backgroundColor: theme_1.theme.colors.secondary,
    },
    planDetails: {
        gap: theme_1.theme.spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    bestValue: {
        color: theme_1.theme.colors.primary,
        fontWeight: '700',
    },
    bestPlanBadge: {
        position: 'absolute',
        top: -10,
        right: 10,
        backgroundColor: theme_1.theme.colors.primary,
        paddingHorizontal: theme_1.theme.spacing.sm,
        paddingVertical: theme_1.theme.spacing.xs,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    bestPlanText: {
        color: theme_1.theme.colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
});
exports.default = LoanCombinationComparison;
