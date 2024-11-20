import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';

interface LoanAnalysisChartsProps {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>;
}

const LoanAnalysisCharts: React.FC<LoanAnalysisChartsProps> = ({
  monthlyPayment,
  totalPayment,
  totalInterest,
  principal,
  schedule,
}) => {
  const screenWidth = Dimensions.get('window').width - theme.spacing.lg * 2;

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      {/* 还款趋势折线图 */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: schedule
              .filter((_, i) => i % 12 === 0)
              .map(s => `${s.month}期`),
            datasets: [{
              data: schedule
                .filter((_, i) => i % 12 === 0)
                .map(s => s.payment),
              color: () => theme.colors.primary,
              strokeWidth: 2,
            }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
          withInnerLines={false}
        />
      </View>

      {/* 本息比例饼图 */}
      <View style={styles.chartContainer}>
        <PieChart
          data={[
            {
              name: '本金',
              population: principal,
              color: theme.colors.primary,
              legendFontColor: theme.colors.text.primary,
            },
            {
              name: '利息',
              population: totalInterest,
              color: theme.colors.secondary,
              legendFontColor: theme.colors.text.primary,
            },
          ]}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* 还款进度图 */}
      <View style={styles.chartContainer}>
        <ProgressChart
          data={{
            labels: ['还款进度'],
            data: [
              (totalPayment - schedule[0].remainingBalance) / totalPayment,
            ],
          }}
          width={screenWidth}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          }}
          hideLegend={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    ...theme.shadows.small,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  chartContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
  },
});

export default LoanAnalysisCharts; 