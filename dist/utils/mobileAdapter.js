"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMobileAdapter = exports.mobileAdapter = exports.MobileAdapter = void 0;
const react_native_1 = require("react-native");
const useDeviceAdaptation_1 = require("../hooks/useDeviceAdaptation");
class MobileAdapter {
    constructor(config = {}) {
        this.config = Object.assign({ baseWidth: 375, baseHeight: 667, baseFontSize: 14, baseSpacing: 8, minScale: 0.85, maxScale: 1.2 }, config);
        this.window = react_native_1.Dimensions.get('window');
        this.isTablet = this.checkIsTablet();
    }
    checkIsTablet() {
        const { width, height } = this.window;
        const screenSize = Math.sqrt(width * width + height * height);
        return react_native_1.Platform.OS === 'ios' ? react_native_1.Platform.isPad : screenSize >= 1200;
    }
    scaleSize(size) {
        const { width } = this.window;
        const scale = width / this.config.baseWidth;
        const scaledSize = size * scale;
        // 限制缩放范围
        return Math.min(Math.max(scaledSize, size * this.config.minScale), size * this.config.maxScale);
    }
    scaleFontSize(size) {
        const scaledSize = this.scaleSize(size);
        // 平板设备字体稍大
        return this.isTablet ? scaledSize * 1.1 : scaledSize;
    }
    scaleSpacing(spacing) {
        const scaledSpacing = this.scaleSize(spacing);
        // 平板设备间距稍大
        return this.isTablet ? scaledSpacing * 1.15 : scaledSpacing;
    }
    getResponsiveValue(options) {
        const { width } = this.window;
        if (this.isTablet && options.tablet) {
            return options.tablet;
        }
        if (width < 360) {
            return options.small;
        }
        else if (width < 768) {
            return options.medium;
        }
        else {
            return options.large;
        }
    }
    getLayoutStyle(options) {
        const { width, height } = this.window;
        const style = {};
        if (options.maxWidth) {
            style.maxWidth = Math.min(width * 0.9, options.maxWidth);
        }
        if (options.maxHeight) {
            style.maxHeight = Math.min(height * 0.9, options.maxHeight);
        }
        if (options.minWidth) {
            style.minWidth = Math.min(width * 0.3, options.minWidth);
        }
        if (options.minHeight) {
            style.minHeight = Math.min(height * 0.3, options.minHeight);
        }
        if (options.padding) {
            style.padding = this.scaleSpacing(options.padding);
        }
        if (options.margin) {
            style.margin = this.scaleSpacing(options.margin);
        }
        return style;
    }
    getInputStyle(options) {
        return {
            fontSize: options.fontSize ?
                this.scaleFontSize(options.fontSize) :
                this.scaleFontSize(16),
            padding: options.padding ?
                this.scaleSpacing(options.padding) :
                this.scaleSpacing(8),
            height: options.height ?
                this.scaleSize(options.height) :
                this.scaleSize(44),
        };
    }
    getButtonStyle(options) {
        return {
            width: options.width ? this.scaleSize(options.width) : undefined,
            height: options.height ?
                this.scaleSize(options.height) :
                this.scaleSize(44),
            padding: options.padding ?
                this.scaleSpacing(options.padding) :
                this.scaleSpacing(12),
            borderRadius: options.borderRadius ?
                this.scaleSize(options.borderRadius) :
                this.scaleSize(6),
            fontSize: options.fontSize ?
                this.scaleFontSize(options.fontSize) :
                this.scaleFontSize(16),
        };
    }
    getTextStyle(options) {
        const scaledFontSize = this.scaleFontSize(options.fontSize);
        return {
            fontSize: scaledFontSize,
            lineHeight: options.lineHeight ?
                this.scaleSize(options.lineHeight) :
                scaledFontSize * 1.5,
            letterSpacing: options.letterSpacing ?
                this.scaleSize(options.letterSpacing) :
                undefined,
        };
    }
    getIconSize(size) {
        return this.scaleSize(size);
    }
    getScreenSize() {
        return {
            width: this.window.width,
            height: this.window.height,
            isTablet: this.isTablet,
            scale: this.window.scale,
            fontScale: this.window.fontScale,
        };
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
                    adapted[key] = this.scaleSpacing(value);
                }
                else if (key.toLowerCase().includes('font') || key === 'lineHeight') {
                    adapted[key] = this.scaleFontSize(value);
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
exports.MobileAdapter = MobileAdapter;
// 创建一个默认实例
exports.mobileAdapter = new MobileAdapter();
// 创建一个自定义 hook 用于组件中
const useMobileAdapter = (config) => {
    const deviceAdaptation = (0, useDeviceAdaptation_1.useDeviceAdaptation)();
    return new MobileAdapter(Object.assign(Object.assign({}, config), { baseFontSize: deviceAdaptation.baseFontSize, baseSpacing: deviceAdaptation.baseSpacing }));
};
exports.useMobileAdapter = useMobileAdapter;
