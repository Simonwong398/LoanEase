import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface LoanChartProps {
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
}

const LoanChart: React.FC<LoanChartProps> = ({
  principal,
  monthlyPayment,
  totalInterest,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  const data = {
    labels: [t('chart.principal'), t('chart.interest')],
    datasets: [
      {
        data: [principal, totalInterest],
      },
    ],
  };

  return (
    <View>
      <LineChart
        data={data}
        width={screenWidth - theme.spacing.md * 2}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
        }}
      />
    </View>
  );
};

export default LoanChart; 