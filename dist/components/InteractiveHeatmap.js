"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const InteractiveHeatmap = ({ data, xLabels, yLabels, colorScale = [
    'rgb(247, 251, 255)',
    'rgb(222, 235, 247)',
    'rgb(198, 219, 239)',
    'rgb(158, 202, 225)',
    'rgb(107, 174, 214)',
    'rgb(66, 146, 198)',
    'rgb(33, 113, 181)',
    'rgb(8, 81, 156)',
    'rgb(8, 48, 107)',
], onCellPress, width = react_native_1.Dimensions.get('window').width - 32, height = 300, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [selectedCell, setSelectedCell] = (0, react_1.useState)(null);
    const cellWidth = (width - 60) / xLabels.length;
    const cellHeight = (height - 60) / yLabels.length;
    const getColor = (value) => {
        const normalizedValue = Math.min(Math.max(value, 0), 1);
        const index = Math.floor(normalizedValue * (colorScale.length - 1));
        return colorScale[index];
    };
    const handleCellPress = (cell) => {
        setSelectedCell(cell);
        onCellPress === null || onCellPress === void 0 ? void 0 : onCellPress(cell);
    };
    return (<react_native_1.View style={styles.container}>
      {/* Y轴标签 */}
      <react_native_1.View style={styles.yLabels}>
        {yLabels.map((label, i) => (<react_native_1.Text key={label} style={[styles.label, { height: cellHeight }]}>
            {label}
          </react_native_1.Text>))}
      </react_native_1.View>

      {/* 热力图主体 */}
      <react_native_1.View style={styles.heatmapContainer}>
        <react_native_1.View style={styles.grid}>
          {data.map((cell, i) => (<react_native_1.TouchableOpacity key={`${cell.x}-${cell.y}`} style={[
                styles.cell,
                {
                    width: cellWidth,
                    height: cellHeight,
                    backgroundColor: getColor(cell.value),
                    borderColor: selectedCell === cell ? theme_1.theme.colors.primary : 'transparent',
                    borderWidth: selectedCell === cell ? 2 : 0,
                },
            ]} onPress={() => handleCellPress(cell)}/>))}
        </react_native_1.View>

        {/* X轴标签 */}
        <react_native_1.View style={styles.xLabels}>
          {xLabels.map((label) => (<react_native_1.Text key={label} style={[styles.label, { width: cellWidth }]} numberOfLines={1}>
              {label}
            </react_native_1.Text>))}
        </react_native_1.View>
      </react_native_1.View>

      {/* 选中单元格信息 */}
      {selectedCell && (<react_native_1.View style={styles.tooltip}>
          <react_native_1.Text style={styles.tooltipText}>
            {`${selectedCell.x}, ${selectedCell.y}: ${selectedCell.value.toFixed(2)}`}
          </react_native_1.Text>
        </react_native_1.View>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ flexDirection: 'row', padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    yLabels: {
        width: 60,
        marginRight: theme_1.theme.spacing.sm,
    },
    heatmapContainer: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        borderRadius: theme_1.theme.borderRadius.sm,
        margin: 1,
    },
    xLabels: {
        flexDirection: 'row',
        marginTop: theme_1.theme.spacing.sm,
        height: 60,
    },
    label: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
    },
    tooltip: Object.assign({ position: 'absolute', bottom: -40, left: 60, right: 0, padding: theme_1.theme.spacing.sm, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.sm }, theme_1.theme.shadows.small),
    tooltipText: {
        fontSize: 12,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
});
exports.default = InteractiveHeatmap;
