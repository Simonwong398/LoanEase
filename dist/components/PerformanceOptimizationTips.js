"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const performanceMonitor_1 = require("../utils/performanceMonitor");
const PerformanceOptimizationTips = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const metrics = performanceMonitor_1.performanceMonitor.getMetrics();
    const optimizationTips = [
        {
            id: 'highCalculationTime',
            condition: () => {
                const avgTime = performanceMonitor_1.performanceMonitor.getAverageOperationTime('calculateLoan');
                return avgTime > 500; // 如果计算时间超过500ms
            },
            severity: 'high'
        },
        {
            id: 'frequentRecalculation',
            condition: () => {
                const calcCount = metrics.filter(m => m.operation === 'calculateLoan').length;
                return calcCount > 10; // 如果短时间内计算次数过多
            },
            severity: 'medium'
        },
        {
            id: 'largeDataSet',
            condition: () => {
                return metrics.length > 100; // 如果历史记录过多
            },
            severity: 'low'
        }
    ];
    const getRelevantTips = () => optimizationTips.filter(tip => tip.condition());
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('performance.optimizationTips')}</react_native_1.Text>
      <react_native_1.ScrollView>
        {getRelevantTips().map(tip => (<react_native_1.View key={tip.id} style={[styles.tipContainer, styles[`${tip.severity}Priority`]]}>
            <react_native_1.Text style={styles.tipTitle}>
              {t(`performance.tips.${tip.id}.title`)}
            </react_native_1.Text>
            <react_native_1.Text style={styles.tipDescription}>
              {t(`performance.tips.${tip.id}.description`)}
            </react_native_1.Text>
            <react_native_1.Text style={styles.suggestion}>
              {t(`performance.tips.${tip.id}.suggestion`)}
            </react_native_1.Text>
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
    tipContainer: {
        padding: theme_1.theme.spacing.md,
        marginBottom: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderLeftWidth: 4,
    },
    highPriority: {
        borderLeftColor: theme_1.theme.colors.error,
        backgroundColor: `${theme_1.theme.colors.error}10`,
    },
    mediumPriority: {
        borderLeftColor: theme_1.theme.colors.warning,
        backgroundColor: `${theme_1.theme.colors.warning}10`,
    },
    lowPriority: {
        borderLeftColor: theme_1.theme.colors.success,
        backgroundColor: `${theme_1.theme.colors.success}10`,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.primary,
    },
    tipDescription: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    suggestion: {
        fontSize: 14,
        fontStyle: 'italic',
        color: theme_1.theme.colors.text.secondary,
    },
});
exports.default = PerformanceOptimizationTips;
