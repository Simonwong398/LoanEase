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
const react_native_2 = require("react-native");
const PaymentMethodComparison = ({ equalPayment, equalPrincipal, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_2.Dimensions.get('window').width;
    // 准备图表数据 - 每12个月采样一个点
    const getChartData = () => {
        const labels = [];
        const equalPaymentData = [];
        const equalPrincipalData = [];
        for (let i = 0; i < equalPayment.schedule.length; i += 12) {
            labels.push(`${i / 12}年`);
            equalPaymentData.push(equalPayment.schedule[i].payment);
            equalPrincipalData.push(equalPrincipal.schedule[i].payment);
        }
        return {
            labels,
            datasets: [
                {
                    data: equalPaymentData,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    strokeWidth: 2,
                },
                {
                    data: equalPrincipalData,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    strokeWidth: 2,
                },
            ],
        };
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('paymentComparison.title')}</react_native_1.Text>

      <react_native_1.View style={styles.comparisonTable}>
        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.headerCell}>{t('paymentComparison.method')}</react_native_1.Text>
          <react_native_1.Text style={styles.headerCell}>{t('paymentComparison.monthlyPayment')}</react_native_1.Text>
          <react_native_1.Text style={styles.headerCell}>{t('paymentComparison.totalInterest')}</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.cell}>{t('paymentComparison.equalPayment')}</react_native_1.Text>
          <react_native_1.Text style={styles.cell}>¥{equalPayment.monthlyPayment.toFixed(2)}</react_native_1.Text>
          <react_native_1.Text style={styles.cell}>¥{equalPayment.totalInterest.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={styles.row}>
          <react_native_1.Text style={styles.cell}>{t('paymentComparison.equalPrincipal')}</react_native_1.Text>
          <react_native_1.Text style={styles.cell}>¥{equalPrincipal.monthlyPayment.toFixed(2)}*</react_native_1.Text>
          <react_native_1.Text style={styles.cell}>¥{equalPrincipal.totalInterest.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.Text style={styles.note}>* {t('paymentComparison.monthlyDecreasing')}</react_native_1.Text>

      <react_native_1.Text style={styles.subtitle}>{t('paymentComparison.monthlyTrend')}</react_native_1.Text>
      <react_native_chart_kit_1.LineChart data={getChartData()} width={screenWidth - theme_1.theme.spacing.md * 2} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
                borderRadius: 16,
            },
        }} bezier style={styles.chart}/>

      <react_native_1.View style={styles.legend}>
        <react_native_1.View style={styles.legendItem}>
          <react_native_1.View style={[styles.legendColor, { backgroundColor: theme_1.theme.colors.primary }]}/>
          <react_native_1.Text style={styles.legendText}>{t('paymentComparison.equalPayment')}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.legendItem}>
          <react_native_1.View style={[styles.legendColor, { backgroundColor: theme_1.theme.colors.secondary }]}/>
          <react_native_1.Text style={styles.legendText}>{t('paymentComparison.equalPrincipal')}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    comparisonTable: {
        marginBottom: theme_1.theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    headerCell: {
        flex: 1,
        padding: theme_1.theme.spacing.sm,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    cell: {
        flex: 1,
        padding: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.secondary,
    },
    note: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        marginBottom: theme_1.theme.spacing.md,
        fontStyle: 'italic',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    chart: {
        marginVertical: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme_1.theme.spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme_1.theme.spacing.md,
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
exports.default = PaymentMethodComparison;
