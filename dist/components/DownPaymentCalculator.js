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
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const cityPolicies_1 = require("../config/cityPolicies");
const DownPaymentCalculator = ({ totalPrice, cityId, loanType, onDownPaymentChange, onLoanAmountChange, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [downPaymentRate, setDownPaymentRate] = (0, react_1.useState)(0);
    const [downPaymentAmount, setDownPaymentAmount] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const cityPolicy = cityPolicies_1.cityPolicies[cityId];
        if (cityPolicy && loanType) {
            // 根据贷款类型设置首付比例
            const rate = loanType === 'commercialSecondHouse'
                ? cityPolicy.restrictions.secondHome.downPayment
                : cityPolicy.restrictions.firstHome.downPayment;
            setDownPaymentRate(rate);
        }
    }, [cityId, loanType]);
    (0, react_1.useEffect)(() => {
        const price = parseFloat(totalPrice) || 0;
        const calculatedDownPayment = price * (downPaymentRate / 100);
        const loanAmount = price - calculatedDownPayment;
        setDownPaymentAmount(calculatedDownPayment.toFixed(2));
        onDownPaymentChange(calculatedDownPayment);
        onLoanAmountChange(loanAmount);
    }, [totalPrice, downPaymentRate]);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('downPayment.title')}</react_native_1.Text>
      
      <react_native_1.View style={styles.row}>
        <react_native_1.Text style={styles.label}>{t('downPayment.totalPrice')}</react_native_1.Text>
        <react_native_1.TextInput style={styles.input} value={totalPrice} keyboardType="numeric" editable={false}/>
      </react_native_1.View>

      <react_native_1.View style={styles.row}>
        <react_native_1.Text style={styles.label}>{t('downPayment.rate')}</react_native_1.Text>
        <react_native_1.Text style={styles.value}>{downPaymentRate}%</react_native_1.Text>
      </react_native_1.View>

      <react_native_1.View style={styles.row}>
        <react_native_1.Text style={styles.label}>{t('downPayment.amount')}</react_native_1.Text>
        <react_native_1.Text style={styles.value}>¥{downPaymentAmount}</react_native_1.Text>
      </react_native_1.View>

      <react_native_1.View style={styles.row}>
        <react_native_1.Text style={styles.label}>{t('downPayment.loanAmount')}</react_native_1.Text>
        <react_native_1.Text style={styles.value}>
          ¥{(parseFloat(totalPrice) - parseFloat(downPaymentAmount)).toFixed(2)}
        </react_native_1.Text>
      </react_native_1.View>

      <react_native_1.Text style={styles.note}>
        {t('downPayment.note')}
      </react_native_1.Text>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    input: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.sm,
        width: '50%',
        textAlign: 'right',
    },
    note: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        marginTop: theme_1.theme.spacing.md,
        fontStyle: 'italic',
    },
});
exports.default = DownPaymentCalculator;
