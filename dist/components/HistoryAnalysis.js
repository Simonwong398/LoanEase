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
const react_native_chart_kit_1 = require("react-native-chart-kit");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const historyManager_1 = require("../utils/historyManager");
const HistoryAnalysis = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const stats = historyManager_1.historyManager.getHistoryStats();
    const [selectedDimension, setSelectedDimension] = (0, react_1.useState)('amount');
    const getDimensionData = (dimension) => {
        return {
            labels: Array.from({ length: stats.trends[dimension].length }, (_, i) => (i + 1).toString()),
            datasets: [
                {
                    data: stats.trends[dimension],
                    color: () => theme_1.theme.colors.primary,
                },
            ],
        };
    };
    const getDistributionData = () => {
        const ranges = stats.distributions[selectedDimension];
        return Object.entries(ranges).map(([range, count]) => ({
            name: range,
            population: count,
            color: theme_1.theme.colors.primary,
            legendFontColor: theme_1.theme.colors.text.primary,
        }));
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('history.analysis.title')}</react_native_1.Text>

      {/* 维度选择器 */}
      <react_native_1.View style={styles.dimensionSelector}>
        {['amount', 'rate', 'term', 'monthlyPayment'].map(dimension => (<react_native_1.TouchableOpacity key={dimension} style={[
                styles.dimensionButton,
                selectedDimension === dimension && styles.selectedDimension
            ]} onPress={() => setSelectedDimension(dimension)}>
            <react_native_1.Text style={[
                styles.dimensionText,
                selectedDimension === dimension && styles.selectedDimensionText
            ]}>
              {t(`history.analysis.dimensions.${dimension}`)}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>))}
      </react_native_1.View>

      {/* 趋势图表 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_1.Text style={styles.sectionTitle}>{t('history.analysis.trends')}</react_native_1.Text>
        <react_native_chart_kit_1.LineChart data={getDimensionData(selectedDimension)} width={react_native_1.Dimensions.get('window').width - theme_1.theme.spacing.lg * 4} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        }} bezier withDots={false} withInnerLines={false}/>
      </react_native_1.View>

      {/* 分布图表 */}
      <react_native_1.View style={styles.chartContainer}>
        <react_native_1.Text style={styles.sectionTitle}>{t('history.analysis.distribution')}</react_native_1.Text>
        <react_native_chart_kit_1.PieChart data={getDistributionData()} width={react_native_1.Dimensions.get('window').width - theme_1.theme.spacing.lg * 4} height={220} chartConfig={{
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        }} accessor="population" backgroundColor="transparent" paddingLeft="15"/>
      </react_native_1.View>

      {/* 统计摘要 */}
      <react_native_1.View style={styles.statsContainer}>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('history.analysis.average')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>
            {stats.averages[selectedDimension].toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('history.analysis.median')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>
            {stats.medians[selectedDimension].toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.statItem}>
          <react_native_1.Text style={styles.statLabel}>{t('history.analysis.mode')}</react_native_1.Text>
          <react_native_1.Text style={styles.statValue}>
            {stats.modes[selectedDimension].toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        margin: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    statsContainer: Object.assign({ flexDirection: 'row', justifyContent: 'space-around', padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, margin: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    statValue: {
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
    commonSection: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, margin: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    commonItem: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    dimensionSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: theme_1.theme.spacing.md,
        gap: theme_1.theme.spacing.sm,
    },
    dimensionButton: {
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
    },
    selectedDimension: {
        backgroundColor: theme_1.theme.colors.primary,
        borderColor: theme_1.theme.colors.primary,
    },
    dimensionText: {
        color: theme_1.theme.colors.text.primary,
        fontSize: 14,
    },
    selectedDimensionText: {
        color: theme_1.theme.colors.surface,
        fontWeight: '600',
    },
});
exports.default = HistoryAnalysis;
