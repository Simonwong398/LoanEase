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
const LoanCostPieChart = ({ principal, totalInterest, otherCosts = 0, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_1.Dimensions.get('window').width;
    const chartData = [
        {
            name: t('analysis.principal'),
            population: principal,
            color: theme_1.theme.colors.primary,
            legendFontColor: theme_1.theme.colors.text.primary,
        },
        {
            name: t('analysis.interest'),
            population: totalInterest,
            color: theme_1.theme.colors.secondary,
            legendFontColor: theme_1.theme.colors.text.primary,
        },
        ...(otherCosts > 0 ? [{
                name: t('analysis.otherCosts'),
                population: otherCosts,
                color: theme_1.theme.colors.warning,
                legendFontColor: theme_1.theme.colors.text.primary,
            }] : []),
    ];
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('analysis.costBreakdown')}</react_native_1.Text>
      <react_native_chart_kit_1.PieChart data={chartData} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
        }} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute/>
      <react_native_1.View style={styles.details}>
        {chartData.map((item, index) => (<react_native_1.View key={index} style={styles.detailRow}>
            <react_native_1.View style={styles.labelContainer}>
              <react_native_1.View style={[styles.colorIndicator, { backgroundColor: item.color }]}/>
              <react_native_1.Text style={styles.label}>{item.name}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Text style={styles.amount}>¥{item.population.toLocaleString()}</react_native_1.Text>
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
    details: {
        marginTop: theme_1.theme.spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: theme_1.theme.spacing.sm,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    amount: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '500',
    },
});
exports.default = LoanCostPieChart;
