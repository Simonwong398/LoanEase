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
const useLocalStorage_1 = require("../hooks/useLocalStorage");
const LoanHistory = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [history] = (0, useLocalStorage_1.useLocalStorage)('loanHistory', []);
    const getChartData = () => {
        const lastSixMonths = history.slice(-6);
        return {
            labels: lastSixMonths.map(record => record.date),
            datasets: [{
                    data: lastSixMonths.map(record => record.monthlyPayment),
                }],
        };
    };
    const renderHistoryItem = ({ item }) => (<react_native_1.View style={styles.historyItem}>
      <react_native_1.Text style={styles.date}>{item.date}</react_native_1.Text>
      <react_native_1.Text style={styles.loanType}>{t(`loanType.${item.loanType}`)}</react_native_1.Text>
      <react_native_1.Text style={styles.amount}>¥{item.amount.toFixed(2)}</react_native_1.Text>
      <react_native_1.Text style={styles.details}>
        {t('history.rate')}: {item.rate}% | {t('history.term')}: {item.term} {t('years')}
      </react_native_1.Text>
    </react_native_1.View>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('history.title')}</react_native_1.Text>
      
      {history.length > 0 && (<react_native_chart_kit_1.LineChart data={getChartData()} width={300} height={200} chartConfig={{
                backgroundColor: theme_1.theme.colors.surface,
                backgroundGradientFrom: theme_1.theme.colors.surface,
                backgroundGradientTo: theme_1.theme.colors.surface,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            }} bezier style={styles.chart}/>)}

      <react_native_1.FlatList data={history} renderItem={renderHistoryItem} keyExtractor={item => item.id} style={styles.list}/>
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
    chart: {
        marginVertical: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
    },
    list: {
        marginTop: theme_1.theme.spacing.md,
    },
    historyItem: {
        padding: theme_1.theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    date: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
    loanType: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    amount: {
        fontSize: 18,
        color: theme_1.theme.colors.primary,
        marginVertical: theme_1.theme.spacing.xs,
    },
    details: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
});
exports.default = LoanHistory;
