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
const DebtConsolidation = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [debts, setDebts] = (0, react_1.useState)([]);
    const addDebt = () => {
        setDebts([...debts, {
                id: Date.now().toString(),
                amount: '',
                rate: '',
                term: '',
                monthlyPayment: 0
            }]);
    };
    const removeDebt = (id) => {
        setDebts(debts.filter(debt => debt.id !== id));
    };
    const updateDebt = (id, field, value) => {
        setDebts(debts.map(debt => debt.id === id ? Object.assign(Object.assign({}, debt), { [field]: value }) : debt));
    };
    const calculateTotalDebt = () => {
        return debts.reduce((total, debt) => total + (parseFloat(debt.amount) || 0), 0);
    };
    const calculateTotalMonthlyPayment = () => {
        return debts.reduce((total, debt) => total + (debt.monthlyPayment || 0), 0);
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('debtConsolidation.title')}</react_native_1.Text>
      <react_native_1.ScrollView>
        {debts.map(debt => (<react_native_1.View key={debt.id} style={styles.debtItem}>
            <LoanParametersInput_1.default amount={debt.amount} rate={debt.rate} term={debt.term} onAmountChange={(value) => updateDebt(debt.id, 'amount', value)} onRateChange={(value) => updateDebt(debt.id, 'rate', value)} onTermChange={(value) => updateDebt(debt.id, 'term', value)}/>
            <react_native_1.TouchableOpacity style={styles.removeButton} onPress={() => removeDebt(debt.id)}>
              <react_native_1.Text style={styles.removeButtonText}>{t('debtConsolidation.remove')}</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>))}
      </react_native_1.ScrollView>
      
      <react_native_1.TouchableOpacity style={styles.addButton} onPress={addDebt}>
        <react_native_1.Text style={styles.addButtonText}>{t('debtConsolidation.add')}</react_native_1.Text>
      </react_native_1.TouchableOpacity>

      <react_native_1.View style={styles.summary}>
        <react_native_1.Text style={styles.summaryText}>
          {t('debtConsolidation.totalDebt')}: ¥{calculateTotalDebt().toFixed(2)}
        </react_native_1.Text>
        <react_native_1.Text style={styles.summaryText}>
          {t('debtConsolidation.totalMonthly')}: ¥{calculateTotalMonthlyPayment().toFixed(2)}
        </react_native_1.Text>
      </react_native_1.View>
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
    debtItem: {
        marginBottom: theme_1.theme.spacing.md,
    },
    addButton: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.md,
    },
    addButtonText: {
        color: theme_1.theme.colors.surface,
        fontWeight: '600',
    },
    removeButton: {
        backgroundColor: theme_1.theme.colors.error,
        padding: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.sm,
    },
    removeButtonText: {
        color: theme_1.theme.colors.surface,
    },
    summary: {
        marginTop: theme_1.theme.spacing.lg,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    summaryText: {
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.sm,
    },
});
exports.default = DebtConsolidation;
