"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleAdapter = void 0;
const react_native_1 = require("react-native");
class StyleAdapter {
    constructor(deviceAdaptation) {
        this.deviceAdaptation = deviceAdaptation;
    }
    adaptSpacing(value) {
        const { baseSpacing, isTablet, isLandscape } = this.deviceAdaptation;
        let adapted = value * (baseSpacing / 8); // 8是基准值
        if (isTablet && isLandscape) {
            adapted *= 1.2; // 平板横屏时增加间距
        }
        return Math.round(adapted);
    }
    adaptFontSize(size) {
        const { baseFontSize, fontScale } = this.deviceAdaptation;
        const adapted = size * (baseFontSize / 14) * fontScale; // 14是基准字号
        return Math.round(adapted);
    }
    adaptStyle(style) {
        const adapted = {};
        Object.entries(style).forEach(([key, value]) => {
            if (typeof value === 'number') {
                if (key.toLowerCase().includes('padding') ||
                    key.toLowerCase().includes('margin') ||
                    key.toLowerCase().includes('gap') ||
                    key === 'width' ||
                    key === 'height') {
                    adapted[key] = this.adaptSpacing(value);
                }
                else if (key.toLowerCase().includes('font') || key === 'lineHeight') {
                    adapted[key] = this.adaptFontSize(value);
                }
                else {
                    adapted[key] = value;
                }
            }
            else {
                adapted[key] = value;
            }
        });
        return adapted;
    }
    createStyles(styles) {
        const adaptedStyles = {};
        Object.entries(styles).forEach(([key, style]) => {
            adaptedStyles[key] = this.adaptStyle(style);
        });
        return react_native_1.StyleSheet.create(adaptedStyles);
    }
}
exports.StyleAdapter = StyleAdapter;
