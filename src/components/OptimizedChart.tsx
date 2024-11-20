import React, { useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';

interface ChartProps {
  data: any;
  type: 'line' | 'bar' | 'pie';
  width?: number;
  height?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const OptimizedChart: React.FC<ChartProps> = React.memo(({
  data,
  type,
  width = 350,
  height = 220,
  onLayout,
}) => {
  const chartConfig = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  }), []);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
    }
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {renderChart()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
});

OptimizedChart.displayName = 'OptimizedChart';

export default OptimizedChart; 