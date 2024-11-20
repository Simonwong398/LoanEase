"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultChartConfig = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../../theme/theme");
exports.defaultChartConfig = {
    backgroundColor: theme_1.theme.colors.surface,
    decimalPlaces: 2,
};
const BaseChart = ({ data, width, height, config = {}, style, children, }) => {
    const chartConfig = Object.assign(Object.assign({}, exports.defaultChartConfig), config);
    return (<react_native_1.View style={[
            styles.container,
            { width, height, backgroundColor: chartConfig.backgroundColor },
            style,
        ]}>
      {children}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md }, theme_1.theme.shadows.medium),
});
exports.default = BaseChart;
