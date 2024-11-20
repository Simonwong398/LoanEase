"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const react_native_chart_kit_1 = require("react-native-chart-kit");
const ExportStatistics = ({ history }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const calculateStats = () => {
        const total = history.length;
        const successful = history.filter(h => h.status === 'success').length;
        const failed = total - successful;
        const formatStats = history.reduce((acc, item) => {
            acc[item.format] = (acc[item.format] || 0) + 1;
            return acc;
        }, {});
        const totalSize = history.reduce((sum, item) => sum + (item.fileSize || 0), 0);
        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            formatStats,
            totalSize,
        };
    };
    const stats = calculateStats();
    const getColorForFormat = (format) => {
        const color = theme_1.theme.colors[format];
        return typeof color === 'string' ? color : theme_1.theme.colors.primary;
    };
    const formatData = Object.entries(stats.formatStats).map(([format, count]) => ({
        name: format.toUpperCase(),
        population: count,
        color: getColorForFormat(format),
        legendFontColor: theme_1.theme.colors.text.primary,
    }));
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('export.statistics.title')}</react_native_1.Text>

      <react_native_1.View style={styles.statsGrid}>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('export.statistics.total')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>{stats.total}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('export.statistics.successful')}</react_native_1.Text>
          <react_native_1.Text style={[styles.statValue, { color: theme_1.theme.colors.success }]}>
            {stats.successful}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('export.statistics.failed')}</react_native_1.Text>
          <react_native_1.Text style={[styles.statValue, { color: theme_1.theme.colors.error }]}>
            {stats.failed}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('export.statistics.successRate')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>
            {stats.successRate.toFixed(1)}%
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      {formatData.length > 0 && (<react_native_1.View style={styles.chartContainer}>
          <react_native_1.Text style={styles.chartTitle}>{t('export.statistics.formatDistribution')}</react_native_1.Text>
          <react_native_chart_kit_1.PieChart data={formatData} width={300} height={200} chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }} accessor="population" backgroundColor="transparent" paddingLeft="15"/>
        </react_native_1.View>)}

      <react_native_1.View style={styles.totalSize}>
        <react_native_1.Text style={styles.totalSizeLabel}>{t('export.statistics.totalSize')}</react_native_1.Text>
        <react_native_1.Text style={styles.totalSizeValue}>
          {(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
        </react_native_1.Text>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme_1.theme.spacing.lg,
    },
    statItem: {
        width: '50%',
        padding: theme_1.theme.spacing.sm,
    },
    statLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: theme_1.theme.colors.text.primary,
    },
    chartContainer: {
        marginVertical: theme_1.theme.spacing.lg,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    totalSize: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.md,
        paddingTop: theme_1.theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme_1.theme.colors.border,
    },
    totalSizeLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    totalSizeValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = ExportStatistics;
