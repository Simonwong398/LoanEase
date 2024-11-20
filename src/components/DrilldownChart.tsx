import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BarChart, LineChart, ChartData } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface DrilldownLevel {
  id: string;
  title: string;
  data: ChartData;
  children?: { [key: string]: DrilldownLevel };
}

interface DrilldownChartProps {
  data: DrilldownLevel;
  width?: number;
  height?: number;
  chartType?: 'bar' | 'line';
}

const DrilldownChart: React.FC<DrilldownChartProps> = ({
  data,
  width = 300,
  height = 220,
  chartType = 'bar',
}) => {
  const { t } = useLanguage();
  const [currentLevel, setCurrentLevel] = useState<DrilldownLevel>(data);
  const [history, setHistory] = useState<DrilldownLevel[]>([]);

  const handleDataPointClick = (dataIndex: number) => {
    const label = currentLevel.data.labels[dataIndex];
    const nextLevel = currentLevel.children?.[label];
    
    if (nextLevel) {
      setHistory([...history, currentLevel]);
      setCurrentLevel(nextLevel);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousLevel = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentLevel(previousLevel);
    }
  };

  const ChartComponent = (chartType === 'bar' ? BarChart : LineChart) as React.ComponentType<{
    data: ChartData;
    width: number;
    height: number;
    chartConfig: any;
    style?: any;
    onDataPointClick?: (data: { index: number }) => void;
  }>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{t('chart.back')}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{currentLevel.title}</Text>
      </View>

      <ChartComponent
        data={currentLevel.data}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        }}
        style={styles.chart}
        onDataPointClick={({ index }) => handleDataPointClick(index)}
      />

      <View style={styles.breadcrumbs}>
        {history.map((level, index) => (
          <React.Fragment key={level.id}>
            <TouchableOpacity
              onPress={() => {
                setCurrentLevel(level);
                setHistory(history.slice(0, index));
              }}
            >
              <Text style={styles.breadcrumbText}>{level.title}</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>{' >'}</Text>
          </React.Fragment>
        ))}
        <Text style={[styles.breadcrumbText, styles.currentLevel]}>
          {currentLevel.title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
  breadcrumbs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  breadcrumbText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.xs,
  },
  currentLevel: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
});

export default DrilldownChart; 