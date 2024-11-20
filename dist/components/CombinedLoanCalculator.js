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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanParametersInput_1 = __importDefault(require("./LoanParametersInput"));
const loanCalculations_1 = require("../utils/loanCalculations");
const cityPolicies_1 = require("../config/cityPolicies");
const lprService_1 = require("../services/lprService");
const CombinedLoanCalculator = ({ cityId, onCalculate, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const { lprData } = (0, lprService_1.useLPRRate)();
    const cityPolicy = cityPolicies_1.cityPolicies[cityId];
    const [commercialAmount, setCommercialAmount] = (0, react_1.useState)('');
    const [commercialRate, setCommercialRate] = (0, react_1.useState)('');
    const [providentAmount, setProvidentAmount] = (0, react_1.useState)('');
    const [providentRate, setProvidentRate] = (0, react_1.useState)((cityPolicy === null || cityPolicy === void 0 ? void 0 : cityPolicy.providentFund.rate.toString()) || '3.1');
    const [term, setTerm] = (0, react_1.useState)('30');
    const [results, setResults] = (0, react_1.useState)(null);
    // 根据城市政策自动设置商贷利率
    (0, react_1.useEffect)(() => {
        if (lprData && cityPolicy) {
            const baseRate = lprData.fiveYear;
            const finalRate = baseRate + cityPolicy.restrictions.firstHome.lprOffset / 100;
            setCommercialRate(finalRate.toFixed(2));
        }
    }, [lprData, cityPolicy]);
    const handleCalculate = () => {
        const results = (0, loanCalculations_1.calculateCombinedLoan)({
            amount: parseFloat(commercialAmount) || 0,
            rate: parseFloat(commercialRate) || 0,
        }, {
            amount: parseFloat(providentAmount) || 0,
            rate: parseFloat(providentRate) || 0,
        }, parseFloat(term) || 30);
        setResults(results);
        onCalculate(results);
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('combinedLoan.title')}</react_native_1.Text>
      
      {/* 商业贷款部分 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('loanType.commercialHouse.name')}</react_native_1.Text>
        <LoanParametersInput_1.default amount={commercialAmount} rate={commercialRate} term={term} onAmountChange={setCommercialAmount} onRateChange={setCommercialRate} onTermChange={setTerm} showTerm={false}/>
        <react_native_1.Text style={styles.hint}>{t('combinedLoan.commercialHint')}</react_native_1.Text>
      </react_native_1.View>

      {/* 公积金贷款部分 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('loanType.providentFund.name')}</react_native_1.Text>
        <LoanParametersInput_1.default amount={providentAmount} rate={providentRate} term={term} onAmountChange={setProvidentAmount} onRateChange={setProvidentRate} onTermChange={setTerm} showTerm={false} showRate={false}/>
        <react_native_1.Text style={styles.hint}>
          {t('combinedLoan.providentFundHint', { maxAmount: cityPolicy === null || cityPolicy === void 0 ? void 0 : cityPolicy.providentFund.maxAmount })}
        </react_native_1.Text>
      </react_native_1.View>

      {/* 贷款期限 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('input.term')}</react_native_1.Text>
        <LoanParametersInput_1.default amount="" rate="" term={term} onAmountChange={() => { }} onRateChange={() => { }} onTermChange={setTerm} showAmount={false} showRate={false}/>
      </react_native_1.View>

      <react_native_1.TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
        <react_native_1.Text style={styles.calculateButtonText}>
          {t('combinedLoan.calculate')}
        </react_native_1.Text>
      </react_native_1.TouchableOpacity>

      {/* 计算结果 */}
      {results && (<react_native_1.View style={styles.resultsContainer}>
          <react_native_1.View style={styles.resultRow}>
            <react_native_1.Text style={styles.resultLabel}>{t('combinedLoan.commercialPayment')}</react_native_1.Text>
            <react_native_1.Text style={styles.resultValue}>
              ¥{results.commercial.monthlyPayment.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.resultRow}>
            <react_native_1.Text style={styles.resultLabel}>{t('combinedLoan.providentFundPayment')}</react_native_1.Text>
            <react_native_1.Text style={styles.resultValue}>
              ¥{results.providentFund.monthlyPayment.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={[styles.resultRow, styles.totalRow]}>
            <react_native_1.Text style={styles.resultLabel}>{t('combinedLoan.totalMonthly')}</react_native_1.Text>
            <react_native_1.Text style={[styles.resultValue, styles.totalValue]}>
              ¥{results.combined.monthlyPayment.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.resultRow}>
            <react_native_1.Text style={styles.resultLabel}>{t('combinedLoan.totalInterest')}</react_native_1.Text>
            <react_native_1.Text style={styles.resultValue}>
              ¥{results.combined.totalInterest.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>)}
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
    section: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.primary,
    },
    hint: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        marginTop: theme_1.theme.spacing.xs,
        fontStyle: 'italic',
    },
    calculateButton: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
        alignItems: 'center',
        marginVertical: theme_1.theme.spacing.lg,
    },
    calculateButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: Object.assign({ backgroundColor: theme_1.theme.colors.surface, padding: theme_1.theme.spacing.lg, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.md,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: theme_1.theme.colors.border,
        paddingTop: theme_1.theme.spacing.md,
        marginTop: theme_1.theme.spacing.md,
    },
    resultLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    resultValue: {
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '500',
    },
    totalValue: {
        fontSize: 18,
        color: theme_1.theme.colors.primary,
        fontWeight: '700',
    },
});
exports.default = CombinedLoanCalculator;
