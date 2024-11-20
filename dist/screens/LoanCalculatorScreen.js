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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const mathUtils_1 = require("../utils/mathUtils");
const settingsManager_1 = require("../utils/settingsManager");
const historyManager_1 = require("../utils/historyManager");
const useAppSettings_1 = require("../hooks/useAppSettings");
const useInputValidation_1 = require("../hooks/useInputValidation");
const InputErrorMessage_1 = __importDefault(require("../components/InputErrorMessage"));
const LoanCalculatorScreen = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const { settings } = (0, useAppSettings_1.useAppSettings)();
    const { validateAll, getFieldError, clearErrors, } = (0, useInputValidation_1.useInputValidation)();
    // 使用设置中的默认值
    const [amount, setAmount] = (0, react_1.useState)('');
    const [rate, setRate] = (0, react_1.useState)(settings.calculator.defaultRate.toString());
    const [term, setTerm] = (0, react_1.useState)(settings.calculator.defaultTerm.toString());
    const [results, setResults] = (0, react_1.useState)({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
    });
    // 监听设置变化
    (0, react_1.useEffect)(() => {
        const unsubscribe = settingsManager_1.settingsManager.subscribe((newSettings) => {
            // 只在值为空时应用默认值
            if (!rate)
                setRate(newSettings.calculator.defaultRate.toString());
            if (!term)
                setTerm(newSettings.calculator.defaultTerm.toString());
        });
        return unsubscribe;
    }, [rate, term]);
    const calculateLoan = () => __awaiter(void 0, void 0, void 0, function* () {
        clearErrors();
        if (!validateAll(amount, rate, term)) {
            return;
        }
        const principal = parseFloat(amount) || 0;
        const annualRate = parseFloat(rate) || 0;
        const years = parseInt(term) || 0;
        if (principal > 0 && annualRate > 0 && years > 0) {
            // 验证输入是否在允许范围内
            if (principal > settings.calculator.maxLoanAmount) {
                // 显示错误提示
                return;
            }
            if (years > settings.calculator.maxTerm) {
                // 显示错误提示
                return;
            }
            const monthlyRate = annualRate / 12 / 100;
            const months = years * 12;
            const monthlyPayment = mathUtils_1.precise.multiply(principal, mathUtils_1.precise.divide(monthlyRate, 1 - Math.pow(1 + monthlyRate, -months)));
            const totalPayment = mathUtils_1.precise.multiply(monthlyPayment, months);
            const totalInterest = mathUtils_1.precise.subtract(totalPayment, principal);
            const newResults = {
                monthlyPayment,
                totalPayment,
                totalInterest,
            };
            setResults(newResults);
            // 保存计算历史
            if (settings.ui.autoSave) {
                yield historyManager_1.historyManager.addRecord({
                    loanType: settings.calculator.defaultLoanType,
                    amount: principal,
                    rate: annualRate,
                    term: years,
                    monthlyPayment,
                    totalInterest,
                    totalPayment,
                    paymentMethod: 'equalPayment',
                    schedule: [], // 需要生成完整的还款计划
                });
            }
        }
    });
    // 格式化数字，应用设置中的小数位数
    const formatNumber = (value) => {
        return value.toFixed(settings.calculator.roundingDecimals);
    };
    return (<react_native_1.KeyboardAvoidingView behavior={react_native_1.Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <react_native_1.ScrollView contentContainerStyle={[
            styles.scrollContent,
            settings.ui.compactMode && styles.compactContent
        ]}>
        <react_native_1.View style={styles.card}>
          <react_native_1.Text style={styles.title}>{t('calculator.title')}</react_native_1.Text>

          <react_native_1.View style={styles.inputContainer}>
            <react_native_1.Text style={styles.label}>{t('calculator.amount')}</react_native_1.Text>
            <react_native_1.TextInput style={[
            styles.input,
            !!getFieldError('amount') && styles.inputError,
        ]} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder={t('calculator.amountPlaceholder')} placeholderTextColor={theme_1.theme.colors.text.hint} maxLength={settings.calculator.maxInputLength}/>
            <InputErrorMessage_1.default message={getFieldError('amount')} visible={!!getFieldError('amount')}/>
          </react_native_1.View>

          <react_native_1.View style={styles.inputContainer}>
            <react_native_1.Text style={styles.label}>{t('calculator.rate')}</react_native_1.Text>
            <react_native_1.TextInput style={[
            styles.input,
            !!getFieldError('rate') && styles.inputError,
        ]} value={rate} onChangeText={setRate} keyboardType="numeric" placeholder={t('calculator.ratePlaceholder')} placeholderTextColor={theme_1.theme.colors.text.hint}/>
            <InputErrorMessage_1.default message={getFieldError('rate')} visible={!!getFieldError('rate')}/>
          </react_native_1.View>

          <react_native_1.View style={styles.inputContainer}>
            <react_native_1.Text style={styles.label}>{t('calculator.term')}</react_native_1.Text>
            <react_native_1.TextInput style={[
            styles.input,
            !!getFieldError('term') && styles.inputError,
        ]} value={term} onChangeText={setTerm} keyboardType="numeric" placeholder={t('calculator.termPlaceholder')} placeholderTextColor={theme_1.theme.colors.text.hint}/>
            <InputErrorMessage_1.default message={getFieldError('term')} visible={!!getFieldError('term')}/>
          </react_native_1.View>

          <react_native_1.TouchableOpacity style={styles.calculateButton} onPress={calculateLoan}>
            <react_native_1.Text style={styles.buttonText}>{t('calculator.calculate')}</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>

        {results.monthlyPayment > 0 && (<react_native_1.View style={styles.resultsCard}>
            <react_native_1.Text style={styles.resultsTitle}>{t('calculator.results')}</react_native_1.Text>
            
            <react_native_1.View style={styles.resultRow}>
              <react_native_1.Text style={styles.resultLabel}>
                {t('calculator.monthlyPayment')}
              </react_native_1.Text>
              <react_native_1.Text style={styles.resultValue}>
                ¥{formatNumber(results.monthlyPayment)}
              </react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View style={styles.resultRow}>
              <react_native_1.Text style={styles.resultLabel}>
                {t('calculator.totalPayment')}
              </react_native_1.Text>
              <react_native_1.Text style={styles.resultValue}>
                ¥{formatNumber(results.totalPayment)}
              </react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View style={styles.resultRow}>
              <react_native_1.Text style={styles.resultLabel}>
                {t('calculator.totalInterest')}
              </react_native_1.Text>
              <react_native_1.Text style={[styles.resultValue, styles.interestValue]}>
                ¥{formatNumber(results.totalInterest)}
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>)}
      </react_native_1.ScrollView>
    </react_native_1.KeyboardAvoidingView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.background,
    },
    scrollContent: {
        padding: theme_1.theme.spacing.md,
    },
    card: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.lg,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: theme_1.theme.spacing.md,
    },
    label: {
        fontSize: 16,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.md,
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
    },
    calculateButton: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.md,
    },
    buttonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 18,
        fontWeight: '600',
    },
    resultsCard: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg, marginTop: theme_1.theme.spacing.lg }, theme_1.theme.shadows.medium),
    resultsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.md,
        textAlign: 'center',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    resultLabel: {
        fontSize: 16,
        color: theme_1.theme.colors.text.secondary,
    },
    resultValue: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    interestValue: {
        color: theme_1.theme.colors.primary,
    },
    compactContent: {
        padding: theme_1.theme.spacing.sm,
    },
    inputError: {
        borderColor: theme_1.theme.colors.error,
    },
});
exports.default = LoanCalculatorScreen;
