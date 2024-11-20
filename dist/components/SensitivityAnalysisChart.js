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
const SensitivityAnalysisChart = ({ analyses, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_1.Dimensions.get('window').width;
    const chartConfig = {
        backgroundColor: theme_1.theme.colors.surface,
        backgroundGradientFrom: theme_1.theme.colors.surface,
        backgroundGradientTo: theme_1.theme.colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        style: {
            borderRadius: theme_1.theme.borderRadius.md,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme_1.theme.colors.primary,
        },
        propsForLabels: {
            fill: theme_1.theme.colors.text.secondary,
        },
    };
    const formatChartData = (analysis) => {
        return {
            labels: analysis.results.map(r => r.value.toString()),
            datasets: [
                {
                    data: analysis.results.map(r => r.monthlyPayment),
                    color: () => theme_1.theme.colors.primary,
                    strokeWidth: 2,
                },
                {
                    data: analysis.results.map(r => r.totalInterest),
                    color: () => theme_1.theme.colors.secondary,
                    strokeWidth: 2,
                },
            ],
            legend: [t('sensitivity.monthlyPayment'), t('sensitivity.totalInterest')],
        };
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('sensitivity.title')}</react_native_1.Text>

      {analyses.map((analysis, index) => (<react_native_1.View key={index} style={styles.chartContainer}>
          <react_native_1.Text style={styles.chartTitle}>
            {t(`sensitivity.${analysis.parameter}Title`)}
          </react_native_1.Text>
          <react_native_chart_kit_1.LineChart data={formatChartData(analysis)} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={chartConfig} bezier style={styles.chart}/>
          <react_native_1.View style={styles.analysisDetails}>
            {analysis.results.map((result, i) => (<react_native_1.View key={i} style={styles.detailRow}>
                <react_native_1.Text style={styles.detailLabel}>
                  {t(`sensitivity.${analysis.parameter}`)} {result.value}
                </react_native_1.Text>
                <react_native_1.View style={styles.detailValues}>
                  <react_native_1.Text style={styles.detailValue}>
                    ¥{result.monthlyPayment.toFixed(2)}
                  </react_native_1.Text>
                  <react_native_1.Text style={[
                    styles.percentageChange,
                    { color: result.percentageChange > 0 ? theme_1.theme.colors.error : theme_1.theme.colors.success }
                ]}>
                    {result.percentageChange > 0 ? '+' : ''}
                    {result.percentageChange.toFixed(2)}%
                  </react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>))}
          </react_native_1.View>
        </react_native_1.View>))}
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
    chartContainer: {
        marginBottom: theme_1.theme.spacing.xl,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    chart: {
        marginVertical: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
    },
    analysisDetails: {
        marginTop: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    detailLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    detailValues: {
        alignItems: 'flex-end',
    },
    detailValue: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '500',
    },
    percentageChange: {
        fontSize: 12,
        marginTop: theme_1.theme.spacing.xs,
    },
});
exports.default = SensitivityAnalysisChart;
