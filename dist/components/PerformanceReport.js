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
const PerformanceReport = ({ visible, onClose, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const metrics = performanceMonitor_1.performanceMonitor.getMetrics();
    const getOperationGroups = () => {
        const groups = metrics.reduce((acc, metric) => {
            if (!acc[metric.operation]) {
                acc[metric.operation] = [];
            }
            acc[metric.operation].push(metric);
            return acc;
        }, {});
        return Object.entries(groups).map(([operation, operationMetrics]) => ({
            operation,
            avgTime: performanceMonitor_1.performanceMonitor.getAverageOperationTime(operation),
            successRate: (operationMetrics.filter(m => m.success).length / operationMetrics.length) * 100,
            totalCalls: operationMetrics.length,
        }));
    };
    if (!visible)
        return null;
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('performance.title')}</react_native_1.Text>
      
      <react_native_1.ScrollView style={styles.content}>
        {getOperationGroups().map(group => (<react_native_1.View key={group.operation} style={styles.operationCard}>
            <react_native_1.Text style={styles.operationTitle}>
              {t(`performance.operations.${group.operation}`)}
            </react_native_1.Text>
            
            <react_native_1.View style={styles.metricsContainer}>
              <MetricItem label={t('performance.avgTime')} value={`${group.avgTime.toFixed(2)}ms`}/>
              <MetricItem label={t('performance.successRate')} value={`${group.successRate.toFixed(1)}%`} color={group.successRate > 95 ? theme_1.theme.colors.success : theme_1.theme.colors.error}/>
              <MetricItem label={t('performance.totalCalls')} value={group.totalCalls.toString()}/>
            </react_native_1.View>
          </react_native_1.View>))}
      </react_native_1.ScrollView>

      <react_native_1.TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <react_native_1.Text style={styles.closeButtonText}>{t('common.close')}</react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
const MetricItem = ({ label, value, color }) => (<react_native_1.View style={styles.metricItem}>
    <react_native_1.Text style={styles.metricLabel}>{label}</react_native_1.Text>
    <react_native_1.Text style={[styles.metricValue, color && { color }]}>{value}</react_native_1.Text>
  </react_native_1.View>);
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    content: {
        maxHeight: 400,
    },
    operationCard: {
        marginBottom: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    operationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.primary,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    metricItem: {
        flex: 1,
        minWidth: '30%',
        marginVertical: theme_1.theme.spacing.xs,
    },
    metricLabel: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    closeButton: {
        marginTop: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.primary,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
    },
    closeButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = PerformanceReport;
