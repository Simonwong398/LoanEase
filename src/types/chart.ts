export interface ChartDataset {
  data: number[];
  label: string;
  color?: string;
}

export interface ValidatedChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface UnvalidatedChartData {
  labels?: unknown[];
  datasets?: Array<{
    data?: unknown[];
    label?: unknown;
    color?: unknown;
  }>;
} 