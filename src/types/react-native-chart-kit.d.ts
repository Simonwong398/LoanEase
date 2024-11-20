declare module 'react-native-chart-kit' {
  import { ViewStyle } from 'react-native';
  
  interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    color?: (opacity?: number) => string;
    style?: ViewStyle;
    decimalPlaces?: number;
    formatYLabel?: (yLabel: string) => string;
    formatXLabel?: (xLabel: string) => string;
  }

  interface Dataset {
    data: number[];
    color?: string | ((opacity: number) => string);
    strokeWidth?: number;
    withDots?: boolean;
  }

  interface ChartData {
    labels: string[];
    datasets: Dataset[];
  }

  interface BaseChartProps {
    data: ChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: ViewStyle;
    bezier?: boolean;
    withInnerLines?: boolean;
    withOuterLines?: boolean;
    withHorizontalLines?: boolean;
    withVerticalLines?: boolean;
    withDots?: boolean;
    showValuesOnTopOfBars?: boolean;
  }

  interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
  }

  interface PieChartProps extends Omit<BaseChartProps, 'data'> {
    data: PieChartData[];
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
    absolute?: boolean;
  }

  interface ProgressChartData {
    labels: string[];
    data: number[];
  }

  interface ProgressChartProps extends Omit<BaseChartProps, 'data'> {
    data: ProgressChartData;
    strokeWidth?: number;
    radius?: number;
    hideLegend?: boolean;
  }

  export class LineChart extends React.Component<BaseChartProps> {}
  export class BarChart extends React.Component<BaseChartProps> {}
  export class PieChart extends React.Component<PieChartProps> {}
  export class ProgressChart extends React.Component<ProgressChartProps> {}
} 