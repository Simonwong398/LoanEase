"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_chart_kit_1 = require("react-native-chart-kit");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanCostAnalysisCharts = ({ analysis, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_1.Dimensions.get('window').width;
    // 年度还款构成图表数据
    const yearlyPaymentData = {
        labels: Array.from({ length: analysis.yearlyPayment.length }, (_, i) => `${i + 1}`),
        datasets: [
            {
                data: analysis.yearlyPrincipal,
                color: () => theme_1.theme.colors.primary,
                strokeWidth: 2,
            },
            {
                data: analysis.yearlyInterest,
                color: () => theme_1.theme.colors.secondary,
                strokeWidth: 2,
            },
        ],
        legend: [t('analysis.principal'), t('analysis.interest')],
    };
    // 利率敏感性图表数据
    const sensitivityData = {
        labels: analysis.rateSensitivity.map(item => `${item.rate}%`),
        datasets: [
            {
                data: analysis.rateSensitivity.map(item => item.monthlyPayment),
                color: () => theme_1.theme.colors.primary,
                strokeWidth: 2,
            },
        ],
    };
    // 还款方式对比图表数据
    const methodComparisonData = {
        labels: [t('analysis.equalPayment'), t('analysis.equalPrincipal')],
        datasets: [
            {
                data: [
                    analysis.methodComparison.equalPayment.totalInterest,
                    analysis.methodComparison.equalPrincipal.totalInterest,
                ],
            },
        ],
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('analysis.costAnalysis')}</react_native_1.Text>

      {/* 基础成本分析 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.basicCost')}</react_native_1.Text>
        <react_native_1.View style={styles.statsGrid}>
          <react_native_1.View style={styles.statItem}>
            <react_native_1.Text style={styles.statLabel}>{t('analysis.totalCost')}</react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>¥{analysis.totalCost.toFixed(2)}</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.statItem}>
            <react_native_1.Text style={styles.statLabel}>{t('analysis.interestRatio')}</react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>
              {(analysis.interestRatio * 100).toFixed(2)}%
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>

      {/* 年度还款构成 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.yearlyPayment')}</react_native_1.Text>
        <react_native_chart_kit_1.LineChart data={yearlyPaymentData} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
                borderRadius: 16,
            },
        }} bezier style={styles.chart}/>
      </react_native_1.View>

      {/* 利率敏感性分析 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.rateSensitivity')}</react_native_1.Text>
        <react_native_chart_kit_1.LineChart data={sensitivityData} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
                borderRadius: 16,
            },
        }} bezier style={styles.chart}/>
      </react_native_1.View>

      {/* 还款方式对比 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.methodComparison')}</react_native_1.Text>
        <react_native_chart_kit_1.BarChart data={methodComparisonData} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
                borderRadius: 16,
            },
        }} style={styles.chart}/>
        <react_native_1.View style={styles.comparisonDetails}>
          <react_native_1.Text style={styles.comparisonText}>
            {t('analysis.interestDifference')}: 
            ¥{Math.abs(analysis.methodComparison.difference.totalInterest).toFixed(2)}
          </react_native_1.Text>
          <react_native_1.Text style={styles.comparisonText}>
            {t('analysis.monthlyPaymentRange')}: 
            ¥{analysis.methodComparison.equalPrincipal.schedule[analysis.methodComparison.equalPrincipal.schedule.length - 1].payment.toFixed(2)} 
            - 
            ¥{analysis.methodComparison.equalPrincipal.schedule[0].payment.toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
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
    section: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statItem: {
        width: '50%',
        padding: theme_1.theme.spacing.sm,
    },
    statLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    chart: {
        marginVertical: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
    },
    comparisonDetails: {
        marginTop: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    comparisonText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.sm,
    },
});
exports.default = LoanCostAnalysisCharts;
