import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface InteractiveHeatmapProps {
  data: HeatmapData[];
  xLabels: string[];
  yLabels: string[];
  colorScale?: string[];
  onCellPress?: (data: HeatmapData) => void;
  width?: number;
  height?: number;
}

const InteractiveHeatmap: React.FC<InteractiveHeatmapProps> = ({
  data,
  xLabels,
  yLabels,
  colorScale = [
    'rgb(247, 251, 255)',
    'rgb(222, 235, 247)',
    'rgb(198, 219, 239)',
    'rgb(158, 202, 225)',
    'rgb(107, 174, 214)',
    'rgb(66, 146, 198)',
    'rgb(33, 113, 181)',
    'rgb(8, 81, 156)',
    'rgb(8, 48, 107)',
  ],
  onCellPress,
  width = Dimensions.get('window').width - 32,
  height = 300,
}) => {
  const { t } = useLanguage();
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null);

  const cellWidth = (width - 60) / xLabels.length;
  const cellHeight = (height - 60) / yLabels.length;

  const getColor = (value: number) => {
    const normalizedValue = Math.min(Math.max(value, 0), 1);
    const index = Math.floor(normalizedValue * (colorScale.length - 1));
    return colorScale[index];
  };

  const handleCellPress = (cell: HeatmapData) => {
    setSelectedCell(cell);
    onCellPress?.(cell);
  };

  return (
    <View style={styles.container}>
      {/* Y轴标签 */}
      <View style={styles.yLabels}>
        {yLabels.map((label, i) => (
          <Text key={label} style={[styles.label, { height: cellHeight }]}>
            {label}
          </Text>
        ))}
      </View>

      {/* 热力图主体 */}
      <View style={styles.heatmapContainer}>
        <View style={styles.grid}>
          {data.map((cell, i) => (
            <TouchableOpacity
              key={`${cell.x}-${cell.y}`}
              style={[
                styles.cell,
                {
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: getColor(cell.value),
                  borderColor: selectedCell === cell ? theme.colors.primary : 'transparent',
                  borderWidth: selectedCell === cell ? 2 : 0,
                },
              ]}
              onPress={() => handleCellPress(cell)}
            />
          ))}
        </View>

        {/* X轴标签 */}
        <View style={styles.xLabels}>
          {xLabels.map((label) => (
            <Text
              key={label}
              style={[styles.label, { width: cellWidth }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>

      {/* 选中单元格信息 */}
      {selectedCell && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {`${selectedCell.x}, ${selectedCell.y}: ${selectedCell.value.toFixed(2)}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  yLabels: {
    width: 60,
    marginRight: theme.spacing.sm,
  },
  heatmapContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRadius: theme.borderRadius.sm,
    margin: 1,
  },
  xLabels: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    height: 60,
  },
  label: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: -40,
    left: 60,
    right: 0,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.small,
  },
  tooltipText: {
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
});

export default InteractiveHeatmap; 