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
const LoanComparisonRadar = ({ plans }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_1.Dimensions.get('window').width;
    // 计算各个维度的指标
    const calculateMetrics = (method) => {
        const monthlyBurden = method.monthlyPayment / 10000; // 月供负担
        const totalCost = method.totalInterest / method.totalPayment; // 总成本比例
        const flexibility = method.schedule.length / 360; // 灵活度（期限）
        const initialPressure = method.schedule[0].payment / method.monthlyPayment; // 初期压力
        const finalSavings = 1 - (method.totalInterest / (method.totalPayment - method.totalInterest)); // 最终节省
        return [
            monthlyBurden,
            totalCost,
            flexibility,
            initialPressure,
            finalSavings
        ];
    };
    const data = {
        labels: [
            t('analysis.monthlyBurden'),
            t('analysis.totalCost'),
            t('analysis.flexibility'),
            t('analysis.initialPressure'),
            t('analysis.finalSavings')
        ],
        datasets: plans.map(plan => ({
            data: calculateMetrics(plan.method),
            color: () => theme_1.theme.colors.primary,
        })),
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('analysis.comparison')}</react_native_1.Text>
      <react_native_chart_kit_1.RadarChart data={data} width={screenWidth - theme_1.theme.spacing.lg * 2} height={300} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            style: {
                borderRadius: 16,
            },
            propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme_1.theme.colors.primary,
            },
        }} style={styles.chart}/>
      <react_native_1.View style={styles.legend}>
        {plans.map((plan, index) => (<react_native_1.View key={index} style={styles.legendItem}>
            <react_native_1.View style={[
                styles.legendColor,
                { backgroundColor: theme_1.theme.colors.primary }
            ]}/>
            <react_native_1.Text style={styles.legendText}>{plan.name}</react_native_1.Text>
          </react_native_1.View>))}
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
    chart: {
        marginVertical: theme_1.theme.spacing.md,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: theme_1.theme.spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme_1.theme.spacing.md,
        marginBottom: theme_1.theme.spacing.sm,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: theme_1.theme.spacing.sm,
    },
    legendText: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
});
exports.default = LoanComparisonRadar;
