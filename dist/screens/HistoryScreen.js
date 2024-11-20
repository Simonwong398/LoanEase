"use strict";
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
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const useCalculationHistory_1 = require("../hooks/useCalculationHistory");
const exportResults_1 = require("../utils/exportResults");
const HistoryScreen = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const { history, deleteRecord, clearHistory } = (0, useCalculationHistory_1.useCalculationHistory)();
    const handleExport = (record) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, exportResults_1.exportLoanResults)({
                loanType: record.loanType,
                amount: record.amount,
                rate: record.rate,
                term: record.term,
                monthlyPayment: record.monthlyPayment,
                totalPayment: record.totalPayment,
                totalInterest: record.totalInterest,
                schedule: [], // 需要添加还款计划
            }, { format: 'csv' });
        }
        catch (error) {
            console.error('Export failed:', error);
        }
    });
    const renderHistoryItem = ({ item }) => (<react_native_1.View style={styles.historyItem}>
      <react_native_1.View style={styles.itemHeader}>
        <react_native_1.Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </react_native_1.Text>
        <react_native_1.Text style={styles.loanType}>
          {t(`loanType.${item.loanType}.name`)}
        </react_native_1.Text>
      </react_native_1.View>

      <react_native_1.View style={styles.detailsContainer}>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.label}>{t('input.amount')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{item.amount.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.label}>{t('input.rate')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>{item.rate}%</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.label}>{t('results.monthlyPayment')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{item.monthlyPayment.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.label}>{t('results.totalInterest')}</react_native_1.Text>
          <react_native_1.Text style={styles.value}>¥{item.totalInterest.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.View style={styles.actions}>
        <react_native_1.TouchableOpacity style={styles.actionButton} onPress={() => handleExport(item)}>
          <react_native_1.Text style={styles.actionButtonText}>{t('history.export')}</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deleteRecord(item.id)}>
          <react_native_1.Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            {t('history.delete')}
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.View>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>{t('history.title')}</react_native_1.Text>
        {history.length > 0 && (<react_native_1.TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <react_native_1.Text style={styles.clearButtonText}>{t('history.clearAll')}</react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
      </react_native_1.View>

      {history.length === 0 ? (<react_native_1.View style={styles.emptyState}>
          <react_native_1.Text style={styles.emptyStateText}>{t('history.empty')}</react_native_1.Text>
        </react_native_1.View>) : (<react_native_1.FlatList data={history} renderItem={renderHistoryItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContainer}/>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.background,
    },
    header: Object.assign({ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface }, theme_1.theme.shadows.small),
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    clearButton: {
        padding: theme_1.theme.spacing.sm,
    },
    clearButtonText: {
        color: theme_1.theme.colors.error,
        fontSize: 14,
    },
    listContainer: {
        padding: theme_1.theme.spacing.md,
    },
    historyItem: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, marginBottom: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme_1.theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    date: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
    loanType: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.primary,
    },
    detailsContainer: {
        padding: theme_1.theme.spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    value: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: theme_1.theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme_1.theme.colors.border,
    },
    actionButton: {
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        marginLeft: theme_1.theme.spacing.sm,
        backgroundColor: theme_1.theme.colors.primary,
    },
    actionButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 14,
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: theme_1.theme.colors.error,
    },
    deleteButtonText: {
        color: theme_1.theme.colors.surface,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme_1.theme.spacing.xl,
    },
    emptyStateText: {
        fontSize: 16,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
    },
});
exports.default = HistoryScreen;
