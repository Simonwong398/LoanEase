"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_picker_select_1 = __importDefault(require("react-native-picker-select"));
const LanguageContext_1 = require("../i18n/LanguageContext");
const theme_1 = require("../theme/theme");
const loanTypes_1 = require("../config/loanTypes");
const LoanTypeSelector = ({ selectedType, onValueChange }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const loanTypeItems = Object.values(loanTypes_1.loanTypes).map(type => ({
        label: t(`loanType.${type.id}.name`),
        value: type.id,
    }));
    const selectedLoanType = loanTypes_1.loanTypes[selectedType];
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.pickerContainer}>
        <react_native_picker_select_1.default onValueChange={onValueChange} items={loanTypeItems} value={selectedType} style={pickerSelectStyles} placeholder={{ label: t('loanType.placeholder'), value: null }}/>
      </react_native_1.View>

      {selectedLoanType && (<react_native_1.View style={styles.infoContainer}>
          <react_native_1.Text style={styles.description}>
            {t(selectedLoanType.description)}
          </react_native_1.Text>
          <react_native_1.View style={styles.detailsContainer}>
            <DetailItem label={t('loanType.rate')} value={`${selectedLoanType.defaultRate}%`}/>
            <DetailItem label={t('loanType.maxTerm')} value={`${selectedLoanType.maxTerm} ${t('years')}`}/>
            <DetailItem label={t('loanType.amount')} value={`¥${selectedLoanType.minAmount.toLocaleString()} - ¥${selectedLoanType.maxAmount.toLocaleString()}`}/>
          </react_native_1.View>
        </react_native_1.View>)}
    </react_native_1.View>);
};
const DetailItem = ({ label, value }) => (<react_native_1.View style={styles.detailItem}>
    <react_native_1.Text style={styles.detailLabel}>{label}</react_native_1.Text>
    <react_native_1.Text style={styles.detailValue}>{value}</react_native_1.Text>
  </react_native_1.View>);
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    pickerContainer: {
        padding: theme_1.theme.spacing.md,
    },
    infoContainer: {
        padding: theme_1.theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme_1.theme.colors.border,
    },
    description: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.md,
    },
    detailsContainer: {
        marginTop: theme_1.theme.spacing.sm,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    detailLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    detailValue: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '600',
    },
});
const pickerSelectStyles = react_native_1.StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: theme_1.theme.spacing.md,
        paddingHorizontal: theme_1.theme.spacing.md,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
        backgroundColor: theme_1.theme.colors.surface,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: theme_1.theme.spacing.sm,
        paddingHorizontal: theme_1.theme.spacing.md,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
        backgroundColor: theme_1.theme.colors.surface,
    },
});
exports.default = LoanTypeSelector;
