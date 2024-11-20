"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanResults = ({ monthlyPayment, totalPayment, totalInterest, visible, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const fadeAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    react_1.default.useEffect(() => {
        react_native_1.Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [visible]);
    if (!visible)
        return null;
    return (<react_native_1.Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <react_native_1.View style={styles.resultItem}>
        <react_native_1.Text style={styles.label}>{t('results.monthlyPayment')}</react_native_1.Text>
        <react_native_1.Text style={[styles.value, styles.monthlyPayment]}>
          ¥{monthlyPayment.toFixed(2)}
        </react_native_1.Text>
      </react_native_1.View>

      <react_native_1.View style={styles.separator}/>

      <react_native_1.View style={styles.row}>
        <react_native_1.View style={[styles.resultItem, styles.halfWidth]}>
          <react_native_1.Text style={styles.label}>{t('results.totalPayment')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{totalPayment.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.View style={[styles.resultItem, styles.halfWidth]}>
          <react_native_1.Text style={styles.label}>{t('results.totalInterest')}</react_native_1.Text>
          <react_native_1.Text style={[styles.value, styles.interestValue]}>
            ¥{totalInterest.toFixed(2)}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.lg, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    resultItem: {
        marginBottom: theme_1.theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        flex: 1,
        marginHorizontal: theme_1.theme.spacing.xs,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    value: {
        fontSize: 18,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '600',
    },
    monthlyPayment: {
        fontSize: 24,
        color: theme_1.theme.colors.primary,
        fontWeight: '700',
    },
    interestValue: {
        color: theme_1.theme.colors.secondary,
    },
    separator: {
        height: 1,
        backgroundColor: theme_1.theme.colors.border,
        marginVertical: theme_1.theme.spacing.md,
    },
});
exports.default = LoanResults;
