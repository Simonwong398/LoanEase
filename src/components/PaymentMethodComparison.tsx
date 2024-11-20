import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentMethod } from '../utils/loanCalculations';
import { Dimensions } from 'react-native';

interface PaymentMethodComparisonProps {
  equalPayment: PaymentMethod;
  equalPrincipal: PaymentMethod;
}

const PaymentMethodComparison: React.FC<PaymentMethodComparisonProps> = ({
  equalPayment,
  equalPrincipal,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  // 准备图表数据 - 每12个月采样一个点
  const getChartData = () => {
    const labels: string[] = [];
    const equalPaymentData: number[] = [];
    const equalPrincipalData: number[] = [];

    for (let i = 0; i < equalPayment.schedule.length; i += 12) {
      labels.push(`${i/12}年`);
      equalPaymentData.push(equalPayment.schedule[i].payment);
      equalPrincipalData.push(equalPrincipal.schedule[i].payment);
    }

    return {
      labels,
      datasets: [
        {
          data: equalPaymentData,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: equalPrincipalData,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('paymentComparison.title')}</Text>

      <View style={styles.comparisonTable}>
        <View style={styles.row}>
          <Text style={styles.headerCell}>{t('paymentComparison.method')}</Text>
          <Text style={styles.headerCell}>{t('paymentComparison.monthlyPayment')}</Text>
          <Text style={styles.headerCell}>{t('paymentComparison.totalInterest')}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.cell}>{t('paymentComparison.equalPayment')}</Text>
          <Text style={styles.cell}>¥{equalPayment.monthlyPayment.toFixed(2)}</Text>
          <Text style={styles.cell}>¥{equalPayment.totalInterest.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.cell}>{t('paymentComparison.equalPrincipal')}</Text>
          <Text style={styles.cell}>¥{equalPrincipal.monthlyPayment.toFixed(2)}*</Text>
          <Text style={styles.cell}>¥{equalPrincipal.totalInterest.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.note}>* {t('paymentComparison.monthlyDecreasing')}</Text>

      <Text style={styles.subtitle}>{t('paymentComparison.monthlyTrend')}</Text>
      <LineChart
        data={getChartData()}
        width={screenWidth - theme.spacing.md * 2}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>{t('paymentComparison.equalPayment')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.secondary }]} />
          <Text style={styles.legendText}>{t('paymentComparison.equalPrincipal')}</Text>
        </View>
      </View>
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
  comparisonTable: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerCell: {
    flex: 1,
    padding: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  cell: {
    flex: 1,
    padding: theme.spacing.sm,
    color: theme.colors.text.secondary,
  },
  note: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
});

export default PaymentMethodComparison; 