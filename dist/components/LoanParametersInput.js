"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanParametersInput = ({ amount, rate, term, onAmountChange, onRateChange, onTermChange, showAmount = true, showRate = true, showTerm = true, amountLabel, rateLabel, termLabel, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    return (<react_native_1.View style={styles.container}>
      {showAmount && (<react_native_1.View style={styles.inputGroup}>
          <react_native_1.Text style={styles.label}>{amountLabel || t('input.amount')}</react_native_1.Text>
          <react_native_1.TextInput style={styles.input} value={amount} onChangeText={onAmountChange} keyboardType="numeric" placeholder={t('input.amountPlaceholder')} placeholderTextColor={theme_1.theme.colors.text.hint}/>
        </react_native_1.View>)}

      {showRate && (<react_native_1.View style={styles.inputGroup}>
          <react_native_1.Text style={styles.label}>{rateLabel || t('input.rate')}</react_native_1.Text>
          <react_native_1.TextInput style={styles.input} value={rate} onChangeText={onRateChange} keyboardType="numeric" placeholder={t('input.ratePlaceholder')} placeholderTextColor={theme_1.theme.colors.text.hint}/>
        </react_native_1.View>)}

      {showTerm && (<react_native_1.View style={styles.inputGroup}>
          <react_native_1.Text style={styles.label}>{termLabel || t('input.term')}</react_native_1.Text>
          <react_native_1.TextInput style={styles.input} value={term} onChangeText={onTermChange} keyboardType="numeric" placeholder={t('input.termPlaceholder')} placeholderTextColor={theme_1.theme.colors.text.hint}/>
        </react_native_1.View>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, margin: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    inputGroup: {
        marginBottom: theme_1.theme.spacing.md,
    },
    label: {
        fontSize: 16,
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.md,
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
        backgroundColor: theme_1.theme.colors.background,
    },
});
exports.default = LoanParametersInput;
