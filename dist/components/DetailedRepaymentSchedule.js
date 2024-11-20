"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const DetailedRepaymentSchedule = ({ schedule, totalAmount, totalInterest, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [selectedYear, setSelectedYear] = (0, react_1.useState)(1);
    const yearsCount = Math.ceil(schedule.length / 12);
    const getYearlyStats = (year) => {
        const startIndex = (year - 1) * 12;
        const yearlyPayments = schedule.slice(startIndex, startIndex + 12);
        return {
            totalPayment: yearlyPayments.reduce((sum, item) => sum + item.payment, 0),
            totalPrincipal: yearlyPayments.reduce((sum, item) => sum + item.principal, 0),
            totalInterest: yearlyPayments.reduce((sum, item) => sum + item.interest, 0),
            remainingBalance: yearlyPayments[yearlyPayments.length - 1].remainingBalance,
            completionRate: (1 - yearlyPayments[yearlyPayments.length - 1].remainingBalance / totalAmount) * 100
        };
    };
    const yearlyStats = getYearlyStats(selectedYear);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('repaymentSchedule.title')}</react_native_1.Text>

      {/* 年份选择器 */}
      <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearSelector}>
        {Array.from({ length: yearsCount }, (_, i) => i + 1).map(year => (<react_native_1.TouchableOpacity key={year} style={[
                styles.yearButton,
                selectedYear === year && styles.selectedYear
            ]} onPress={() => setSelectedYear(year)}>
            <react_native_1.Text style={[
                styles.yearText,
                selectedYear === year && styles.selectedYearText
            ]}>
              {t('repaymentSchedule.year', { year })}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>))}
      </react_native_1.ScrollView>

      {/* 年度统计 */}
      <react_native_1.View style={styles.yearlyStats}>
        <react_native_1.View style={styles.statRow}>
          <react_native_1.Text style={styles.statLabel}>{t('repaymentSchedule.yearlyPayment')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>¥{yearlyStats.totalPayment.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statRow}>
          <react_native_1.Text style={styles.statLabel}>{t('repaymentSchedule.yearlyPrincipal')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>¥{yearlyStats.totalPrincipal.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statRow}>
          <react_native_1.Text style={styles.statLabel}>{t('repaymentSchedule.yearlyInterest')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>¥{yearlyStats.totalInterest.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statRow}>
          <react_native_1.Text style={styles.statLabel}>{t('repaymentSchedule.completionRate')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>{yearlyStats.completionRate.toFixed(2)}%</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      {/* 月度明细 */}
      <react_native_1.ScrollView style={styles.monthlyDetails}>
        <react_native_1.View style={styles.tableHeader}>
          <react_native_1.Text style={styles.headerCell}>{t('repaymentSchedule.month')}</react_native_1.Text>
          <react_native_1.Text style={styles.headerCell}>{t('repaymentSchedule.payment')}</react_native_1.Text>
          <react_native_1.Text style={styles.headerCell}>{t('repaymentSchedule.principal')}</react_native_1.Text>
          <react_native_1.Text style={styles.headerCell}>{t('repaymentSchedule.interest')}</react_native_1.Text>
          <react_native_1.Text style={styles.headerCell}>{t('repaymentSchedule.remaining')}</react_native_1.Text>
        </react_native_1.View>
        {schedule
            .slice((selectedYear - 1) * 12, selectedYear * 12)
            .map((item, index) => (<react_native_1.View key={item.month} style={styles.tableRow}>
              <react_native_1.Text style={styles.cell}>{item.month}</react_native_1.Text>
              <react_native_1.Text style={styles.cell}>¥{item.payment.toFixed(2)}</react_native_1.Text>
              <react_native_1.Text style={styles.cell}>¥{item.principal.toFixed(2)}</react_native_1.Text>
              <react_native_1.Text style={styles.cell}>¥{item.interest.toFixed(2)}</react_native_1.Text>
              <react_native_1.Text style={styles.cell}>¥{item.remainingBalance.toFixed(2)}</react_native_1.Text>
            </react_native_1.View>))}
      </react_native_1.ScrollView>
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
    yearSelector: {
        flexDirection: 'row',
        marginBottom: theme_1.theme.spacing.md,
    },
    yearButton: {
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        marginRight: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        backgroundColor: theme_1.theme.colors.background,
    },
    selectedYear: {
        backgroundColor: theme_1.theme.colors.primary,
    },
    yearText: {
        color: theme_1.theme.colors.text.primary,
    },
    selectedYearText: {
        color: theme_1.theme.colors.surface,
    },
    yearlyStats: {
        marginBottom: theme_1.theme.spacing.lg,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    statLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    monthlyDetails: {
        maxHeight: 400,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme_1.theme.colors.background,
        paddingVertical: theme_1.theme.spacing.sm,
    },
    headerCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
        paddingVertical: theme_1.theme.spacing.sm,
    },
    cell: {
        flex: 1,
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
    },
});
exports.default = DetailedRepaymentSchedule;
