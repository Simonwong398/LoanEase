"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const react_native_chart_kit_1 = require("react-native-chart-kit");
const react_native_2 = require("react-native");
const LoanPlanComparison = ({ plans, onSelectPlan, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_2.Dimensions.get('window').width;
    // 计算每月还款对比数据
    const getMonthlyPaymentData = () => {
        const maxMonths = Math.max(...plans.map(plan => plan.data.schedule.length));
        const labels = Array.from({ length: Math.min(maxMonths, 12) }, (_, i) => `${i + 1}${t('month')}`);
        return {
            labels,
            datasets: plans.map(plan => ({
                data: plan.data.schedule.slice(0, 12).map(item => item.payment),
                color: () => plan.color,
                strokeWidth: 2,
            })),
            legend: plans.map(plan => plan.name),
        };
    };
    // 计算总成本对比
    const getTotalCostComparison = () => {
        return plans.map(plan => (Object.assign(Object.assign({}, plan), { principal: plan.data.totalPayment - plan.data.totalInterest, interest: plan.data.totalInterest, total: plan.data.totalPayment })));
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('comparison.title')}</react_native_1.Text>

      {/* 月供对比图表 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_1.Text style={styles.sectionTitle}>{t('comparison.monthlyPayment')}</react_native_1.Text>
        <react_native_chart_kit_1.LineChart data={getMonthlyPaymentData()} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }} bezier style={styles.chart}/>
      </react_native_1.View>

      {/* 总成本对比 */}
      <react_native_1.View style={styles.costComparison}>
        <react_native_1.Text style={styles.sectionTitle}>{t('comparison.totalCost')}</react_native_1.Text>
        {getTotalCostComparison().map(plan => (<react_native_1.TouchableOpacity key={plan.id} style={styles.planCard} onPress={() => onSelectPlan === null || onSelectPlan === void 0 ? void 0 : onSelectPlan(plan.id)}>
            <react_native_1.Text style={styles.planName}>{plan.name}</react_native_1.Text>
            <react_native_1.View style={styles.costBreakdown}>
              <react_native_1.View style={styles.costItem}>
                <react_native_1.Text style={styles.costLabel}>{t('comparison.principal')}</react_native_1.Text>
                <react_native_1.Text style={styles.costValue}>¥{plan.principal.toFixed(2)}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.costItem}>
                <react_native_1.Text style={styles.costLabel}>{t('comparison.interest')}</react_native_1.Text>
                <react_native_1.Text style={[styles.costValue, { color: theme_1.theme.colors.secondary }]}>
                  ¥{plan.interest.toFixed(2)}
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={[styles.costItem, styles.totalCost]}>
                <react_native_1.Text style={styles.costLabel}>{t('comparison.total')}</react_native_1.Text>
                <react_native_1.Text style={[styles.costValue, { color: theme_1.theme.colors.primary }]}>
                  ¥{plan.total.toFixed(2)}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>))}
      </react_native_1.View>

      {/* 关键指标对比 */}
      <react_native_1.View style={styles.metricsComparison}>
        <react_native_1.Text style={styles.sectionTitle}>{t('comparison.keyMetrics')}</react_native_1.Text>
        <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {plans.map(plan => (<react_native_1.View key={plan.id} style={styles.metricCard}>
              <react_native_1.Text style={[styles.metricTitle, { color: plan.color }]}>{plan.name}</react_native_1.Text>
              <react_native_1.View style={styles.metricItem}>
                <react_native_1.Text style={styles.metricLabel}>{t('comparison.monthlyPayment')}</react_native_1.Text>
                <react_native_1.Text style={styles.metricValue}>¥{plan.data.monthlyPayment.toFixed(2)}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.metricItem}>
                <react_native_1.Text style={styles.metricLabel}>{t('comparison.totalInterest')}</react_native_1.Text>
                <react_native_1.Text style={styles.metricValue}>¥{plan.data.totalInterest.toFixed(2)}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.View style={styles.metricItem}>
                <react_native_1.Text style={styles.metricLabel}>{t('comparison.term')}</react_native_1.Text>
                <react_native_1.Text style={styles.metricValue}>
                  {Math.ceil(plan.data.schedule.length / 12)}{t('years')}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>))}
        </react_native_1.ScrollView>
      </react_native_1.View>
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        margin: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    chartContainer: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, margin: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    chart: {
        borderRadius: theme_1.theme.borderRadius.md,
    },
    costComparison: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, margin: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    planCard: {
        marginBottom: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.primary,
    },
    costBreakdown: {
        gap: theme_1.theme.spacing.sm,
    },
    costItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    costLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    costValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    totalCost: {
        borderTopWidth: 1,
        borderTopColor: theme_1.theme.colors.border,
        paddingTop: theme_1.theme.spacing.sm,
        marginTop: theme_1.theme.spacing.sm,
    },
    metricsComparison: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, margin: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    metricCard: {
        width: 200,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
        marginRight: theme_1.theme.spacing.md,
    },
    metricTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
    },
    metricItem: {
        marginBottom: theme_1.theme.spacing.sm,
    },
    metricLabel: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = LoanPlanComparison;
