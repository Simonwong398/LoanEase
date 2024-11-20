"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_chart_kit_1 = require("react-native-chart-kit");
const theme_1 = require("../theme/theme");
const LoanAnalysisCharts = ({ monthlyPayment, totalPayment, totalInterest, principal, schedule, }) => {
    const screenWidth = react_native_1.Dimensions.get('window').width - theme_1.theme.spacing.lg * 2;
    const chartConfig = {
        backgroundColor: theme_1.theme.colors.surface,
        backgroundGradientFrom: theme_1.theme.colors.surface,
        backgroundGradientTo: theme_1.theme.colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    };
    return (<react_native_1.View style={styles.container}>
      {/* 还款趋势折线图 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_chart_kit_1.LineChart data={{
            labels: schedule
                .filter((_, i) => i % 12 === 0)
                .map(s => `${s.month}期`),
            datasets: [{
                    data: schedule
                        .filter((_, i) => i % 12 === 0)
                        .map(s => s.payment),
                    color: () => theme_1.theme.colors.primary,
                    strokeWidth: 2,
                }],
        }} width={screenWidth} height={220} chartConfig={chartConfig} style={styles.chart} bezier withInnerLines={false}/>
      </react_native_1.View>

      {/* 本息比例饼图 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_chart_kit_1.PieChart data={[
            {
                name: '本金',
                population: principal,
                color: theme_1.theme.colors.primary,
                legendFontColor: theme_1.theme.colors.text.primary,
            },
            {
                name: '利息',
                population: totalInterest,
                color: theme_1.theme.colors.secondary,
                legendFontColor: theme_1.theme.colors.text.primary,
            },
        ]} width={screenWidth} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute/>
      </react_native_1.View>

      {/* 还款进度图 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_chart_kit_1.ProgressChart data={{
            labels: ['还款进度'],
            data: [
                (totalPayment - schedule[0].remainingBalance) / totalPayment,
            ],
        }} width={screenWidth} height={220} strokeWidth={16} radius={32} chartConfig={Object.assign(Object.assign({}, chartConfig), { color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})` })} hideLegend={false}/>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md, gap: theme_1.theme.spacing.lg }, theme_1.theme.shadows.small),
    chart: {
        marginVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.md,
    },
    chartContainer: {
        flex: 1,
        borderRadius: theme_1.theme.borderRadius.md,
    },
});
exports.default = LoanAnalysisCharts;
