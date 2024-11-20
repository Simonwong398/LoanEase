import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useCalculationHistory, CalculationRecord } from '../hooks/useCalculationHistory';
import { exportLoanResults } from '../utils/exportResults';

const HistoryScreen: React.FC = () => {
  const { t } = useLanguage();
  const { history, deleteRecord, clearHistory } = useCalculationHistory();

  const handleExport = async (record: CalculationRecord) => {
    try {
      await exportLoanResults(
        {
          loanType: record.loanType,
          amount: record.amount,
          rate: record.rate,
          term: record.term,
          monthlyPayment: record.monthlyPayment,
          totalPayment: record.totalPayment,
          totalInterest: record.totalInterest,
          schedule: [], // 需要添加还款计划
        },
        { format: 'csv' }
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderHistoryItem = ({ item }: { item: CalculationRecord }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.loanType}>
          {t(`loanType.${item.loanType}.name`)}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('input.amount')}</Text>
          <Text style={styles.value}>¥{item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('input.rate')}</Text>
          <Text style={styles.value}>{item.rate}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('results.monthlyPayment')}</Text>
          <Text style={styles.value}>¥{item.monthlyPayment.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('results.totalInterest')}</Text>
          <Text style={styles.value}>¥{item.totalInterest.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleExport(item)}
        >
          <Text style={styles.actionButtonText}>{t('history.export')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteRecord(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            {t('history.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('history.title')}</Text>
        {history.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearHistory}
          >
            <Text style={styles.clearButtonText}>{t('history.clearAll')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('history.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  clearButtonText: {
    color: theme.colors.error,
    fontSize: 14,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  date: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  loanType: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  detailsContainer: {
    padding: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  deleteButtonText: {
    color: theme.colors.surface,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default HistoryScreen; 