"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanAnalysisComparison = ({ equalPayment, equalPrincipal, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    // 计算关键指标的差异
    const differences = {
        totalInterest: equalPayment.totalInterest - equalPrincipal.totalInterest,
        firstPayment: equalPayment.monthlyPayment - equalPrincipal.schedule[0].payment,
        lastPayment: equalPayment.monthlyPayment - equalPrincipal.schedule[equalPrincipal.schedule.length - 1].payment,
        averagePayment: equalPayment.monthlyPayment -
            (equalPrincipal.totalPayment / equalPrincipal.schedule.length),
    };
    // 计算每年的还款情况
    const getYearlyAnalysis = () => {
        const yearlyData = [];
        for (let year = 0; year < equalPrincipal.schedule.length / 12; year++) {
            const yearStart = year * 12;
            const equalPaymentYearTotal = equalPayment.monthlyPayment * 12;
            const equalPrincipalYearTotal = equalPrincipal.schedule
                .slice(yearStart, yearStart + 12)
                .reduce((sum, item) => sum + item.payment, 0);
            yearlyData.push({
                year: year + 1,
                equalPayment: equalPaymentYearTotal,
                equalPrincipal: equalPrincipalYearTotal,
                difference: equalPaymentYearTotal - equalPrincipalYearTotal,
            });
        }
        return yearlyData;
    };
    const yearlyAnalysis = getYearlyAnalysis();
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('analysis.title')}</react_native_1.Text>

      {/* 总体对比 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.overview')}</react_native_1.Text>
        <react_native_1.View style={styles.comparisonRow}>
          <react_native_1.Text style={styles.label}>{t('analysis.totalInterest')}</react_native_1.Text>
          <react_native_1.View style={styles.valueContainer}>
            <react_native_1.Text style={styles.value}>
              等额本息: ¥{equalPayment.totalInterest.toFixed(2)}
            </react_native_1.Text>
            <react_native_1.Text style={styles.value}>
              等额本金: ¥{equalPrincipal.totalInterest.toFixed(2)}
            </react_native_1.Text>
            <react_native_1.Text style={[styles.difference, { color: differences.totalInterest > 0 ? theme_1.theme.colors.error : theme_1.theme.colors.success }]}>
              差额: ¥{Math.abs(differences.totalInterest).toFixed(2)}
              {differences.totalInterest > 0 ? ' 多' : ' 少'}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>

      {/* 月供变化分析 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.monthlyPayment')}</react_native_1.Text>
        <react_native_1.View style={styles.comparisonRow}>
          <react_native_1.Text style={styles.label}>{t('analysis.firstMonth')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{equalPrincipal.schedule[0].payment.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.comparisonRow}>
          <react_native_1.Text style={styles.label}>{t('analysis.lastMonth')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>
            ¥{equalPrincipal.schedule[equalPrincipal.schedule.length - 1].payment.toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.comparisonRow}>
          <react_native_1.Text style={styles.label}>{t('analysis.monthlyFixed')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{equalPayment.monthlyPayment.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      {/* 年度还款分析 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('analysis.yearlyComparison')}</react_native_1.Text>
        <react_native_1.ScrollView style={styles.yearlyTable}>
          <react_native_1.View style={styles.tableHeader}>
            <react_native_1.Text style={styles.headerCell}>{t('analysis.year')}</react_native_1.Text>
            <react_native_1.Text style={styles.headerCell}>{t('analysis.equalPayment')}</react_native_1.Text>
            <react_native_1.Text style={styles.headerCell}>{t('analysis.equalPrincipal')}</react_native_1.Text>
            <react_native_1.Text style={styles.headerCell}>{t('analysis.difference')}</react_native_1.Text>
          </react_native_1.View>
          {yearlyAnalysis.map((year) => (<react_native_1.View key={year.year} style={styles.tableRow}>
              <react_native_1.Text style={styles.cell}>{year.year}</react_native_1.Text>
              <react_native_1.Text style={styles.cell}>¥{year.equalPayment.toFixed(0)}</react_native_1.Text>
              <react_native_1.Text style={styles.cell}>¥{year.equalPrincipal.toFixed(0)}</react_native_1.Text>
              <react_native_1.Text style={[styles.cell, { color: year.difference > 0 ? theme_1.theme.colors.error : theme_1.theme.colors.success }]}>
                ¥{Math.abs(year.difference).toFixed(0)}
              </react_native_1.Text>
            </react_native_1.View>))}
        </react_native_1.ScrollView>
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
    section: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.primary,
    },
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    label: {
        flex: 1,
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    valueContainer: {
        flex: 2,
    },
    value: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'right',
    },
    difference: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    yearlyTable: {
        maxHeight: 200,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme_1.theme.colors.background,
        padding: theme_1.theme.spacing.sm,
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
        padding: theme_1.theme.spacing.sm,
    },
    cell: {
        flex: 1,
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
    },
});
exports.default = LoanAnalysisComparison;
