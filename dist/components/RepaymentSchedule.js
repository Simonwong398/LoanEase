"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const RepaymentSchedule = ({ loanAmount, monthlyPayment, annualRate, termInYears, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const calculateSchedule = () => {
        const schedule = [];
        let balance = loanAmount;
        const monthlyRate = annualRate / 12 / 100;
        for (let month = 1; month <= termInYears * 12; month++) {
            const interest = balance * monthlyRate;
            const principal = monthlyPayment - interest;
            balance -= principal;
            schedule.push({
                month,
                payment: monthlyPayment,
                principal,
                interest,
                remainingBalance: Math.max(0, balance),
            });
        }
        return schedule;
    };
    const renderItem = ({ item }) => (<react_native_1.View style={styles.row}>
      <react_native_1.Text style={styles.cell}>{item.month}</react_native_1.Text>
      <react_native_1.Text style={styles.cell}>¥{item.payment.toFixed(2)}</react_native_1.Text>
      <react_native_1.Text style={styles.cell}>¥{item.principal.toFixed(2)}</react_native_1.Text>
      <react_native_1.Text style={styles.cell}>¥{item.interest.toFixed(2)}</react_native_1.Text>
      <react_native_1.Text style={styles.cell}>¥{item.remainingBalance.toFixed(2)}</react_native_1.Text>
    </react_native_1.View>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('schedule.title')}</react_native_1.Text>
      <react_native_1.View style={styles.headerRow}>
        <react_native_1.Text style={styles.headerCell}>{t('schedule.month')}</react_native_1.Text>
        <react_native_1.Text style={styles.headerCell}>{t('schedule.payment')}</react_native_1.Text>
        <react_native_1.Text style={styles.headerCell}>{t('schedule.principal')}</react_native_1.Text>
        <react_native_1.Text style={styles.headerCell}>{t('schedule.interest')}</react_native_1.Text>
        <react_native_1.Text style={styles.headerCell}>{t('schedule.balance')}</react_native_1.Text>
      </react_native_1.View>
      <react_native_1.FlatList data={calculateSchedule()} renderItem={renderItem} keyExtractor={(item) => item.month.toString()}/>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        padding: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.sm,
    },
    headerCell: {
        flex: 1,
        color: theme_1.theme.colors.surface,
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        padding: theme_1.theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    cell: {
        flex: 1,
        fontSize: 12,
        textAlign: 'center',
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = RepaymentSchedule;
