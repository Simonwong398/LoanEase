"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsive = void 0;
const react_native_1 = require("react-native");
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = react_native_1.Dimensions.get('window');
// 设计稿基准尺寸
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
/**
 * 响应式布局工具
 * 用于处理不同屏幕尺寸的适配
 */
exports.responsive = {
    /**
     * 水平方向自适应
     * @param size 设计稿尺寸
     * @returns 适配后的尺寸
     */
    w: (size) => {
        return (WINDOW_WIDTH / DESIGN_WIDTH) * size;
    },
    /**
     * 垂直方向自适应
     * @param size 设计稿尺寸
     * @returns 适配后的尺寸
     */
    h: (size) => {
        return (WINDOW_HEIGHT / DESIGN_HEIGHT) * size;
    },
    /**
     * 字体大小自适应
     * @param size 设计稿字体大小
     * @returns 适配后的字体大小
     */
    font: (size) => {
        return react_native_1.Platform.select({
            ios: exports.responsive.w(size),
            android: exports.responsive.w(size) * 0.9, // Android字体略小
        });
    },
    /**
     * 判断是否是平板设备
     * @returns 是否是平板
     */
    isTablet: () => {
        return WINDOW_WIDTH >= 768;
    },
    /**
     * 获取屏幕方向
     * @returns 屏幕方向
     */
    getOrientation: () => {
        return WINDOW_WIDTH > WINDOW_HEIGHT ? 'landscape' : 'portrait';
    },
};
