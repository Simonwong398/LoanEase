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
const PrepaymentPlanComparison = ({ originalLoan, plans, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    // 计算投资回报率 (ROI)
    const calculateROI = (plan) => {
        const savedInterest = mathUtils_1.precise.subtract(originalLoan.totalInterest, plan.result.totalInterest);
        return mathUtils_1.precise.multiply(mathUtils_1.precise.divide(savedInterest, plan.amount), 100);
    };
    // 计算月供节省率
    const calculateMonthlySavingRate = (plan) => {
        if (!plan.isReduceTerm) {
            const monthlyReduction = mathUtils_1.precise.subtract(originalLoan.monthlyPayment, plan.result.monthlyPayment);
            return mathUtils_1.precise.multiply(mathUtils_1.precise.divide(monthlyReduction, originalLoan.monthlyPayment), 100);
        }
        return 0;
    };
    // 计算提前还款压力指数
    const calculatePressureIndex = (plan) => {
        const monthlyIncomePressure = mathUtils_1.precise.divide(plan.amount, plan.month);
        const originalMonthlyPressure = originalLoan.monthlyPayment;
        return mathUtils_1.precise.divide(monthlyIncomePressure, originalMonthlyPressure);
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('prepayment.comparison.title')}</react_native_1.Text>

      <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <react_native_1.View style={styles.plansContainer}>
          {/* 原始贷款信息 */}
          <react_native_1.View style={styles.planCard}>
            <react_native_1.Text style={styles.planTitle}>{t('prepayment.comparison.original')}</react_native_1.Text>
            <react_native_1.View style={styles.dataRow}>
              <react_native_1.Text style={styles.label}>{t('prepayment.comparison.monthlyPayment')}</react_native_1.Text>
              <react_native_1.Text style={styles.value}>¥{originalLoan.monthlyPayment.toFixed(2)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.dataRow}>
              <react_native_1.Text style={styles.label}>{t('prepayment.comparison.totalInterest')}</react_native_1.Text>
              <react_native_1.Text style={styles.value}>¥{originalLoan.totalInterest.toFixed(2)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.dataRow}>
              <react_native_1.Text style={styles.label}>{t('prepayment.comparison.term')}</react_native_1.Text>
              <react_native_1.Text style={styles.value}>{originalLoan.term * 12} {t('months')}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>

          {/* 提前还款方案对比 */}
          {plans.map((plan, index) => (<react_native_1.View key={index} style={styles.planCard}>
              <react_native_1.Text style={styles.planTitle}>
                {t('prepayment.comparison.plan', { number: index + 1 })}
              </react_native_1.Text>
              
              {/* 基本信息 */}
              <react_native_1.View style={styles.dataRow}>
                <react_native_1.Text style={styles.label}>{t('prepayment.comparison.prepayAmount')}</react_native_1.Text>
                <react_native_1.Text style={styles.value}>¥{plan.amount.toFixed(2)}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.dataRow}>
                <react_native_1.Text style={styles.label}>{t('prepayment.comparison.prepayMonth')}</react_native_1.Text>
                <react_native_1.Text style={styles.value}>{plan.month}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.dataRow}>
                <react_native_1.Text style={styles.label}>{t('prepayment.comparison.method')}</react_native_1.Text>
                <react_native_1.Text style={styles.value}>
                  {plan.isReduceTerm ?
                t('prepayment.reduceTerm') :
                t('prepayment.reducePayment')}
                </react_native_1.Text>
              </react_native_1.View>

              {/* 效果分析 */}
              <react_native_1.View style={styles.separator}/>
              <react_native_1.View style={styles.dataRow}>
                <react_native_1.Text style={styles.label}>{t('prepayment.comparison.savedInterest')}</react_native_1.Text>
                <react_native_1.Text style={[styles.value, styles.highlight]}>
                  ¥{mathUtils_1.precise.subtract(originalLoan.totalInterest, plan.result.totalInterest).toFixed(2)}
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.dataRow}>
                <react_native_1.Text style={styles.label}>{t('prepayment.comparison.roi')}</react_native_1.Text>
                <react_native_1.Text style={[styles.value, styles.highlight]}>
                  {calculateROI(plan).toFixed(2)}%
                </react_native_1.Text>
              </react_native_1.View>
              {!plan.isReduceTerm && (<react_native_1.View style={styles.dataRow}>
                  <react_native_1.Text style={styles.label}>{t('prepayment.comparison.monthlySaving')}</react_native_1.Text>
                  <react_native_1.Text style={[styles.value, styles.highlight]}>
                    {calculateMonthlySavingRate(plan).toFixed(2)}%
                  </react_native_1.Text>
                </react_native_1.View>)}
              <react_native_1.View style={styles.dataRow}>
                <react_native_1.Text style={styles.label}>{t('prepayment.comparison.pressureIndex')}</react_native_1.Text>
                <react_native_1.Text style={[styles.value, styles.highlight]}>
                  {calculatePressureIndex(plan).toFixed(2)}
                </react_native_1.Text>
              </react_native_1.View>

              {/* 建议 */}
              <react_native_1.View style={styles.suggestionContainer}>
                <react_native_1.Text style={styles.suggestionText}>
                  {calculatePressureIndex(plan) > 2 ?
                t('prepayment.comparison.highPressure') :
                t('prepayment.comparison.reasonable')}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>))}
        </react_native_1.View>
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        margin: theme_1.theme.spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
    },
    plansContainer: {
        flexDirection: 'row',
        gap: theme_1.theme.spacing.md,
    },
    planCard: Object.assign({ width: 280, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg }, theme_1.theme.shadows.small),
    planTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    separator: {
        height: 1,
        backgroundColor: theme_1.theme.colors.border,
        marginVertical: theme_1.theme.spacing.md,
    },
    suggestionContainer: {
        marginTop: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: `${theme_1.theme.colors.primary}10`,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    suggestionText: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        fontStyle: 'italic',
    },
});
exports.default = PrepaymentPlanComparison;
