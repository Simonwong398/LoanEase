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
const validationCache_1 = require("../utils/validationCache");
const ValidationPerformanceReport = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [stats, setStats] = react_1.default.useState(validationCache_1.validationCache.getDetailedStats());
    react_1.default.useEffect(() => {
        const interval = setInterval(() => {
            setStats(validationCache_1.validationCache.getDetailedStats());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const hitRateData = {
        labels: Object.keys(stats.hitRateByType),
        datasets: [{
                data: Object.values(stats.hitRateByType).map(rate => rate * 100),
            }],
    };
    const ageDistributionData = [
        {
            name: t('cache.fresh'),
            population: stats.ageDistribution.fresh,
            color: theme_1.theme.colors.success,
            legendFontColor: theme_1.theme.colors.text.primary,
        },
        {
            name: t('cache.recent'),
            population: stats.ageDistribution.recent,
            color: theme_1.theme.colors.warning,
            legendFontColor: theme_1.theme.colors.text.primary,
        },
        {
            name: t('cache.old'),
            population: stats.ageDistribution.old,
            color: theme_1.theme.colors.error,
            legendFontColor: theme_1.theme.colors.text.primary,
        },
    ];
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('performance.validation.title')}</react_native_1.Text>

      {/* 基础指标 */}
      <react_native_1.View style={styles.metricsContainer}>
        <react_native_1.View style={styles.metricItem}>
          <react_native_1.Text style={styles.metricLabel}>{t('performance.hitRate')}</react_native_1.Text>
          <react_native_1.Text style={styles.metricValue}>
            {(stats.avgHitRate * 100).toFixed(1)}%
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.metricItem}>
          <react_native_1.Text style={styles.metricLabel}>{t('performance.cacheSize')}</react_native_1.Text>
          <react_native_1.Text style={styles.metricValue}>{stats.size}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.metricItem}>
          <react_native_1.Text style={styles.metricLabel}>{t('performance.avgAccessTime')}</react_native_1.Text>
          <react_native_1.Text style={styles.metricValue}>
            {stats.avgAccessTime.toFixed(2)}ms
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      {/* 命中率图表 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.hitRateByType')}</react_native_1.Text>
        <react_native_chart_kit_1.LineChart data={hitRateData} width={styles.chart.width} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        }} bezier style={styles.chart}/>
      </react_native_1.View>

      {/* 缓存年龄分布 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.ageDistribution')}</react_native_1.Text>
        <react_native_chart_kit_1.PieChart data={ageDistributionData} width={styles.chart.width} height={220} chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }} accessor="population" backgroundColor="transparent" paddingLeft="15"/>
      </react_native_1.View>

      {/* 持久化指标 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('performance.persistence')}</react_native_1.Text>
        <react_native_1.View style={styles.metricRow}>
          <react_native_1.Text style={styles.metricLabel}>{t('performance.loadTime')}</react_native_1.Text>
          <react_native_1.Text style={styles.metricValue}>
            {stats.persistenceMetrics.loadTime.toFixed(2)}ms
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.metricRow}>
          <react_native_1.Text style={styles.metricLabel}>{t('performance.saveTime')}</react_native_1.Text>
          <react_native_1.Text style={styles.metricValue}>
            {stats.persistenceMetrics.saveTime.toFixed(2)}ms
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.metricRow}>
          <react_native_1.Text style={styles.metricLabel}>{t('performance.errorRate')}</react_native_1.Text>
          <react_native_1.Text style={styles.metricValue}>
            {(stats.persistenceMetrics.errorRate * 100).toFixed(2)}%
          </react_native_1.Text>
        </react_native_1.View>
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
    metricsContainer: Object.assign({ flexDirection: 'row', justifyContent: 'space-around', padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, margin: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    chartContainer: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, margin: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    chart: {
        width: react_native_1.Dimensions.get('window').width - theme_1.theme.spacing.lg * 4,
        borderRadius: theme_1.theme.borderRadius.md,
    },
    section: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, margin: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
});
exports.default = ValidationPerformanceReport;
