import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
    label?: string;
  }[];
}

export interface ChartConfig {
  backgroundColor: string;
  decimalPlaces?: number;
  formatYLabel?: (value: string) => string;
  formatXLabel?: (value: string) => string;
  style?: ViewStyle;
}

export interface BaseChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  config?: Partial<ChartConfig>;
  style?: ViewStyle;
  onDataPointClick?: (value: number, index: number, dataset: number) => void;
  children?: React.ReactNode;
}

export const defaultChartConfig: ChartConfig = {
  backgroundColor: theme.colors.surface,
  decimalPlaces: 2,
};

const BaseChart: React.FC<BaseChartProps> = ({
  data,
  width,
  height,
  config = {},
  style,
  children,
}) => {
  const chartConfig = { ...defaultChartConfig, ...config };

  return (
    <View
      style={[
        styles.container,
        { width, height, backgroundColor: chartConfig.backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
});

export default BaseChart; 