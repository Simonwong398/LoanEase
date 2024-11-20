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
const DetailedRepaymentSchedule_1 = __importDefault(require("./DetailedRepaymentSchedule"));
const PrepaymentCalculator = ({ originalLoan, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [prepaymentAmount, setPrepaymentAmount] = (0, react_1.useState)('');
    const [prepaymentMonth, setPrepaymentMonth] = (0, react_1.useState)('12');
    const [reduceTerm, setReduceTerm] = (0, react_1.useState)(true);
    const [results, setResults] = (0, react_1.useState)(null);
    const calculatePrepayment = () => {
        const amount = parseFloat(prepaymentAmount);
        const month = parseInt(prepaymentMonth);
        if (amount > 0 && month > 0) {
            const prepaymentResult = (0, loanCalculations_1.calculateWithPrepayment)(originalLoan.principal, originalLoan.rate, originalLoan.term, {
                amount,
                month,
                method: reduceTerm ? 'reduce_term' : 'reduce_payment'
            });
            // 计算节省的利息
            const originalTotalPayment = originalLoan.monthlyPayment * originalLoan.term * 12;
            const savedInterest = originalTotalPayment - prepaymentResult.totalPayment;
            // 计算减少的月数（如果选择缩短期限）
            const savedMonths = reduceTerm ?
                (originalLoan.term * 12 - prepaymentResult.schedule.length) : 0;
            setResults({
                prepaymentPlan: prepaymentResult,
                savings: {
                    interest: savedInterest,
                    months: savedMonths
                }
            });
        }
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('prepayment.title')}</react_native_1.Text>

      {/* 提前还款输入部分 */}
      <react_native_1.View style={styles.inputSection}>
        <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.input')}</react_native_1.Text>
        <LoanParametersInput_1.default amount={prepaymentAmount} rate="" term={prepaymentMonth} onAmountChange={setPrepaymentAmount} onRateChange={() => { }} onTermChange={setPrepaymentMonth} showRate={false} showTerm={true} termLabel={t('prepayment.monthLabel')}/>
      </react_native_1.View>

      {/* 还款方式选择 */}
      <react_native_1.View style={styles.optionSection}>
        <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.method')}</react_native_1.Text>
        <react_native_1.View style={styles.switchContainer}>
          <react_native_1.Text style={styles.optionText}>
            {t(reduceTerm ? 'prepayment.reduceTerm' : 'prepayment.reducePayment')}
          </react_native_1.Text>
          <react_native_1.Switch value={reduceTerm} onValueChange={setReduceTerm} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.TouchableOpacity style={styles.calculateButton} onPress={calculatePrepayment}>
        <react_native_1.Text style={styles.calculateButtonText}>
          {t('prepayment.calculate')}
        </react_native_1.Text>
      </react_native_1.TouchableOpacity>

      {/* 计算结果展示 */}
      {results && (<react_native_1.View style={styles.resultsSection}>
          <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.results')}</react_native_1.Text>
          
          {/* 节省情况 */}
          <react_native_1.View style={styles.savingsContainer}>
            <react_native_1.View style={styles.savingItem}>
              <react_native_1.Text style={styles.savingLabel}>{t('prepayment.savedInterest')}</react_native_1.Text>
              <react_native_1.Text style={[styles.savingValue, styles.highlight]}>
                ¥{results.savings.interest.toFixed(2)}
              </react_native_1.Text>
            </react_native_1.View>
            {reduceTerm && results.savings.months > 0 && (<react_native_1.View style={styles.savingItem}>
                <react_native_1.Text style={styles.savingLabel}>{t('prepayment.savedMonths')}</react_native_1.Text>
                <react_native_1.Text style={[styles.savingValue, styles.highlight]}>
                  {results.savings.months} {t('prepayment.months')}
                </react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.View>

          {/* 新的还款计划 */}
          <react_native_1.View style={styles.scheduleContainer}>
            <react_native_1.Text style={styles.sectionTitle}>{t('prepayment.newSchedule')}</react_native_1.Text>
            <DetailedRepaymentSchedule_1.default schedule={results.prepaymentPlan.schedule} totalAmount={originalLoan.principal} totalInterest={results.prepaymentPlan.totalInterest}/>
          </react_native_1.View>
        </react_native_1.View>)}

      <react_native_1.Text style={styles.note}>{t('prepayment.note')}</react_native_1.Text>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    inputSection: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    optionSection: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    optionText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    calculateButton: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.lg,
    },
    calculateButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    resultsSection: {
        marginTop: theme_1.theme.spacing.lg,
    },
    savingsContainer: {
        backgroundColor: theme_1.theme.colors.background,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        marginBottom: theme_1.theme.spacing.lg,
    },
    savingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    savingLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    savingValue: {
        fontSize: 16,
        fontWeight: '500',
        color: theme_1.theme.colors.text.primary,
    },
    highlight: {
        color: theme_1.theme.colors.primary,
        fontWeight: '700',
    },
    scheduleContainer: {
        marginTop: theme_1.theme.spacing.lg,
    },
    note: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        marginTop: theme_1.theme.spacing.md,
        fontStyle: 'italic',
    },
});
exports.default = PrepaymentCalculator;
