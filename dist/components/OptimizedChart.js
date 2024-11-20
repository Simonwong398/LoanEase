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
const OptimizedChart = react_1.default.memo(({ data, type, width = 350, height = 220, onLayout, }) => {
    const chartConfig = (0, react_1.useMemo)(() => ({
        backgroundColor: theme_1.theme.colors.surface,
        backgroundGradientFrom: theme_1.theme.colors.surface,
        backgroundGradientTo: theme_1.theme.colors.surface,
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    }), []);
    const renderChart = () => {
        switch (type) {
            case 'line':
                return (<react_native_chart_kit_1.LineChart data={data} width={width} height={height} chartConfig={chartConfig} bezier style={styles.chart}/>);
            case 'bar':
                return (<react_native_chart_kit_1.BarChart data={data} width={width} height={height} chartConfig={chartConfig} style={styles.chart}/>);
            case 'pie':
                return (<react_native_chart_kit_1.PieChart data={data} width={width} height={height} chartConfig={chartConfig} accessor="value" backgroundColor="transparent" paddingLeft="15" style={styles.chart}/>);
        }
    };
    return (<react_native_1.View style={styles.container} onLayout={onLayout}>
      {renderChart()}
    </react_native_1.View>);
});
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ alignItems: 'center', justifyContent: 'center', backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md }, theme_1.theme.shadows.medium),
    chart: {
        borderRadius: theme_1.theme.borderRadius.md,
    },
});
OptimizedChart.displayName = 'OptimizedChart';
exports.default = OptimizedChart;
