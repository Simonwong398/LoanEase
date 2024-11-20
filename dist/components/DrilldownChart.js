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
const DrilldownChart = ({ data, width = 300, height = 220, chartType = 'bar', }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [currentLevel, setCurrentLevel] = (0, react_1.useState)(data);
    const [history, setHistory] = (0, react_1.useState)([]);
    const handleDataPointClick = (dataIndex) => {
        var _a;
        const label = currentLevel.data.labels[dataIndex];
        const nextLevel = (_a = currentLevel.children) === null || _a === void 0 ? void 0 : _a[label];
        if (nextLevel) {
            setHistory([...history, currentLevel]);
            setCurrentLevel(nextLevel);
        }
    };
    const handleBack = () => {
        if (history.length > 0) {
            const previousLevel = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentLevel(previousLevel);
        }
    };
    const ChartComponent = (chartType === 'bar' ? react_native_chart_kit_1.BarChart : react_native_chart_kit_1.LineChart);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        {history.length > 0 && (<react_native_1.TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <react_native_1.Text style={styles.backButtonText}>{t('chart.back')}</react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
        <react_native_1.Text style={styles.title}>{currentLevel.title}</react_native_1.Text>
      </react_native_1.View>

      <ChartComponent data={currentLevel.data} width={width} height={height} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        }} style={styles.chart} onDataPointClick={({ index }) => handleDataPointClick(index)}/>

      <react_native_1.View style={styles.breadcrumbs}>
        {history.map((level, index) => (<react_1.default.Fragment key={level.id}>
            <react_native_1.TouchableOpacity onPress={() => {
                setCurrentLevel(level);
                setHistory(history.slice(0, index));
            }}>
              <react_native_1.Text style={styles.breadcrumbText}>{level.title}</react_native_1.Text>
            </react_native_1.TouchableOpacity>
            <react_native_1.Text style={styles.breadcrumbSeparator}>{' >'}</react_native_1.Text>
          </react_1.default.Fragment>))}
        <react_native_1.Text style={[styles.breadcrumbText, styles.currentLevel]}>
          {currentLevel.title}
        </react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md }, theme_1.theme.shadows.medium),
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.md,
    },
    backButton: {
        marginRight: theme_1.theme.spacing.md,
    },
    backButtonText: {
        color: theme_1.theme.colors.primary,
        fontSize: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    chart: {
        borderRadius: theme_1.theme.borderRadius.md,
    },
    breadcrumbs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme_1.theme.spacing.sm,
    },
    breadcrumbText: {
        fontSize: 12,
        color: theme_1.theme.colors.primary,
    },
    breadcrumbSeparator: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        marginHorizontal: theme_1.theme.spacing.xs,
    },
    currentLevel: {
        color: theme_1.theme.colors.text.primary,
        fontWeight: '600',
    },
});
exports.default = DrilldownChart;
