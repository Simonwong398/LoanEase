"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const ExportPreview = ({ template, loanData, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const renderSection = (section) => {
        var _a, _b;
        switch (section.type) {
            case 'basic':
                return (<react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>{t('export.preview.basic')}</react_native_1.Text>
            <react_native_1.View style={styles.row}>
              <react_native_1.Text style={styles.label}>{t('export.preview.amount')}</react_native_1.Text>
              <react_native_1.Text style={styles.value}>
                ¥{(loanData.totalPayment - loanData.totalInterest).toFixed(2)}
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.row}>
              <react_native_1.Text style={styles.label}>{t('export.preview.monthlyPayment')}</react_native_1.Text>
              <react_native_1.Text style={styles.value}>¥{loanData.monthlyPayment.toFixed(2)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.row}>
              <react_native_1.Text style={styles.label}>{t('export.preview.totalInterest')}</react_native_1.Text>
              <react_native_1.Text style={styles.value}>¥{loanData.totalInterest.toFixed(2)}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>);
            case 'schedule':
                return (<react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>{t('export.preview.schedule')}</react_native_1.Text>
            {((_a = section.options) === null || _a === void 0 ? void 0 : _a.detailLevel) === 'detailed' ? (<react_native_1.ScrollView style={styles.scheduleContainer}>
                {loanData.schedule.slice(0, 5).map((item, index) => (<react_native_1.View key={index} style={styles.scheduleRow}>
                    <react_native_1.Text style={styles.scheduleCell}>{item.month}</react_native_1.Text>
                    <react_native_1.Text style={styles.scheduleCell}>¥{item.payment.toFixed(2)}</react_native_1.Text>
                    <react_native_1.Text style={styles.scheduleCell}>¥{item.principal.toFixed(2)}</react_native_1.Text>
                    <react_native_1.Text style={styles.scheduleCell}>¥{item.interest.toFixed(2)}</react_native_1.Text>
                  </react_native_1.View>))}
                <react_native_1.Text style={styles.previewNote}>
                  {t('export.preview.moreItems', { count: loanData.schedule.length - 5 })}
                </react_native_1.Text>
              </react_native_1.ScrollView>) : (<react_native_1.View>
                <react_native_1.Text style={styles.summaryText}>
                  {t('export.preview.scheduleSummary', {
                            months: loanData.schedule.length,
                            firstPayment: loanData.schedule[0].payment.toFixed(2),
                            lastPayment: loanData.schedule[loanData.schedule.length - 1].payment.toFixed(2),
                        })}
                </react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.View>);
            case 'analysis':
                return (<react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>{t('export.preview.analysis')}</react_native_1.Text>
            {((_b = section.options) === null || _b === void 0 ? void 0 : _b.includeCharts) && (<react_native_1.View style={styles.chartPlaceholder}>
                <react_native_1.Text style={styles.placeholderText}>
                  {t('export.preview.chartPlaceholder')}
                </react_native_1.Text>
              </react_native_1.View>)}
            <react_native_1.Text style={styles.analysisText}>
              {t('export.preview.analysisContent')}
            </react_native_1.Text>
          </react_native_1.View>);
            case 'comparison':
                return (<react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>{t('export.preview.comparison')}</react_native_1.Text>
            <react_native_1.Text style={styles.comparisonText}>
              {t('export.preview.comparisonContent')}
            </react_native_1.Text>
          </react_native_1.View>);
        }
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{template.name}</react_native_1.Text>
      {template.sections
            .filter(section => section.enabled)
            .map((section, index) => (<react_native_1.View key={index}>
            {renderSection(section)}
          </react_native_1.View>))}
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.background,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: theme_1.theme.colors.text.primary,
    },
    scheduleContainer: {
        maxHeight: 200,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme_1.theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    scheduleCell: {
        flex: 1,
        fontSize: 12,
        textAlign: 'right',
        color: theme_1.theme.colors.text.primary,
    },
    previewNote: {
        fontSize: 12,
        fontStyle: 'italic',
        color: theme_1.theme.colors.text.secondary,
        marginTop: theme_1.theme.spacing.sm,
        textAlign: 'center',
    },
    summaryText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
    chartPlaceholder: {
        height: 150,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.md,
    },
    placeholderText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        fontStyle: 'italic',
    },
    analysisText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
    comparisonText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
});
exports.default = ExportPreview;
