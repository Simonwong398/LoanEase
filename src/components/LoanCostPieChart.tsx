import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoanCostPieChartProps {
  principal: number;
  totalInterest: number;
  otherCosts?: number;
}

const LoanCostPieChart: React.FC<LoanCostPieChartProps> = ({
  principal,
  totalInterest,
  otherCosts = 0,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  const chartData = [
    {
      name: t('analysis.principal'),
      population: principal,
      color: theme.colors.primary,
      legendFontColor: theme.colors.text.primary,
    },
    {
      name: t('analysis.interest'),
      population: totalInterest,
      color: theme.colors.secondary,
      legendFontColor: theme.colors.text.primary,
    },
    ...(otherCosts > 0 ? [{
      name: t('analysis.otherCosts'),
      population: otherCosts,
      color: theme.colors.warning,
      legendFontColor: theme.colors.text.primary,
    }] : []),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('analysis.costBreakdown')}</Text>
      <PieChart
        data={chartData}
        width={screenWidth - theme.spacing.lg * 2}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View style={styles.details}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.label}>{item.name}</Text>
            </View>
            <Text style={styles.amount}>¥{item.population.toLocaleString()}</Text>
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
  details: {
    marginTop: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  amount: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
});

export default LoanCostPieChart; 