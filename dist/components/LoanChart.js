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
const LoanChart = ({ principal, monthlyPayment, totalInterest, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_1.Dimensions.get('window').width;
    const data = {
        labels: [t('chart.principal'), t('chart.interest')],
        datasets: [
            {
                data: [principal, totalInterest],
            },
        ],
    };
    return (<react_native_1.View>
      <react_native_chart_kit_1.LineChart data={data} width={screenWidth - theme_1.theme.spacing.md * 2} height={220} chartConfig={{
            backgroundColor: theme_1.theme.colors.surface,
            backgroundGradientFrom: theme_1.theme.colors.surface,
            backgroundGradientTo: theme_1.theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            style: {
                borderRadius: 16,
            },
        }} bezier style={{
            marginVertical: theme_1.theme.spacing.md,
            borderRadius: theme_1.theme.borderRadius.md,
        }}/>
    </react_native_1.View>);
};
exports.default = LoanChart;
