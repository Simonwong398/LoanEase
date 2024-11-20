import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface LoanRecord {
  id: string;
  date: string;
  loanType: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
}

const LoanHistory: React.FC = () => {
  const { t } = useLanguage();
  const [history] = useLocalStorage<LoanRecord[]>('loanHistory', []);

  const getChartData = () => {
    const lastSixMonths = history.slice(-6);
    return {
      labels: lastSixMonths.map(record => record.date),
      datasets: [{
        data: lastSixMonths.map(record => record.monthlyPayment),
      }],
    };
  };

  const renderHistoryItem = ({ item }: { item: LoanRecord }) => (
    <View style={styles.historyItem}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.loanType}>{t(`loanType.${item.loanType}`)}</Text>
      <Text style={styles.amount}>¥{item.amount.toFixed(2)}</Text>
      <Text style={styles.details}>
        {t('history.rate')}: {item.rate}% | {t('history.term')}: {item.term} {t('years')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('history.title')}</Text>
      
      {history.length > 0 && (
        <LineChart
          data={getChartData()}
          width={300}
          height={200}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      )}

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  list: {
    marginTop: theme.spacing.md,
  },
  historyItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  date: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  loanType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  amount: {
    fontSize: 18,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
  details: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

export default LoanHistory; 