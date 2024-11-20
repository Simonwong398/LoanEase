import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { RadarChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { PaymentMethod } from '../utils/loanCalculations';

interface LoanComparisonRadarProps {
  plans: {
    name: string;
    method: PaymentMethod;
  }[];
}

const LoanComparisonRadar: React.FC<LoanComparisonRadarProps> = ({ plans }) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  // 计算各个维度的指标
  const calculateMetrics = (method: PaymentMethod) => {
    const monthlyBurden = method.monthlyPayment / 10000; // 月供负担
    const totalCost = method.totalInterest / method.totalPayment; // 总成本比例
    const flexibility = method.schedule.length / 360; // 灵活度（期限）
    const initialPressure = method.schedule[0].payment / method.monthlyPayment; // 初期压力
    const finalSavings = 1 - (method.totalInterest / (method.totalPayment - method.totalInterest)); // 最终节省

    return [
      monthlyBurden,
      totalCost,
      flexibility,
      initialPressure,
      finalSavings
    ];
  };

  const data = {
    labels: [
      t('analysis.monthlyBurden'),
      t('analysis.totalCost'),
      t('analysis.flexibility'),
      t('analysis.initialPressure'),
      t('analysis.finalSavings')
    ],
    datasets: plans.map(plan => ({
      data: calculateMetrics(plan.method),
      color: () => theme.colors.primary,
    })),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analysis.comparison')}</Text>
      <RadarChart
        data={data}
        width={screenWidth - theme.spacing.lg * 2}
        height={300}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        style={styles.chart}
      />
      <View style={styles.legend}>
        {plans.map((plan, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.primary }
              ]} 
            />
            <Text style={styles.legendText}>{plan.name}</Text>
          </View>
        ))}
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
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  chart: {
    marginVertical: theme.spacing.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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

export default LoanComparisonRadar; 