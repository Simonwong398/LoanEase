"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const performanceMetrics_1 = require("../utils/performanceMetrics");
const PerformanceMetricsReport = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [metrics, setMetrics] = react_1.default.useState(performanceMetrics_1.performanceMetricsCollector.getMetrics());
    react_1.default.useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(performanceMetrics_1.performanceMetricsCollector.getMetrics());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const formatValue = (value, unit = '') => {
        return `${value.toFixed(2)}${unit}`;
    };
    const renderMetricItem = (label, value, unit = '') => (<react_native_1.View style={styles.metricItem}>
      <react_native_1.Text style={styles.metricLabel}>{label}</react_native_1.Text>
      <react_native_1.Text style={styles.metricValue}>{formatValue(value, unit)}</react_native_1.Text>
    </react_native_1.View>);
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('performance.metrics.title')}</react_native_1.Text>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.metrics.calculation')}</react_native_1.Text>
        {renderMetricItem(t('performance.metrics.calculationTime'), metrics.calculationTime, 'ms')}
        {renderMetricItem(t('performance.metrics.operationsPerSecond'), metrics.operationsPerSecond, '/s')}
        {renderMetricItem(t('performance.metrics.cacheHitRate'), metrics.cacheHitRate * 100, '%')}
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.metrics.memory')}</react_native_1.Text>
        {renderMetricItem(t('performance.metrics.memoryUsage'), metrics.memoryUsage * 100, '%')}
        {renderMetricItem(t('performance.metrics.peakMemoryUsage'), metrics.peakMemoryUsage * 100, '%')}
        {renderMetricItem(t('performance.metrics.gcCollections'), metrics.gcCollections)}
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.metrics.batch')}</react_native_1.Text>
        {renderMetricItem(t('performance.metrics.avgBatchSize'), metrics.avgBatchSize)}
        {renderMetricItem(t('performance.metrics.batchThroughput'), metrics.batchThroughput, '/s')}
        {renderMetricItem(t('performance.metrics.batchLatency'), metrics.batchLatency, 'ms')}
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.metrics.system')}</react_native_1.Text>
        {renderMetricItem(t('performance.metrics.cpuUsage'), metrics.cpuUsage * 100, '%')}
        {renderMetricItem(t('performance.metrics.threadCount'), metrics.threadCount)}
        {renderMetricItem(t('performance.metrics.ioOperations'), metrics.ioOperations)}
      </react_native_1.View>
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
    metricItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme_1.theme.spacing.sm,
    },
    metricLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '500',
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = PerformanceMetricsReport;
