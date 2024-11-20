"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformStyles = void 0;
const react_native_1 = require("react-native");
/**
 * 平台特定样式工具
 * 用于处理不同平台的样式差异
 */
exports.platformStyles = {
    /**
     * 根据平台返回特定样式
     * @param ios iOS平台样式
     * @param android Android平台样式
     * @returns 平台特定样式
     */
    select: (ios, android) => {
        return react_native_1.Platform.select({
            ios,
            android,
        });
    },
    /**
     * 获取平台特定阴影样式
     * @param elevation Android阴影高度
     * @param opacity iOS阴影不透明度
     * @returns 平台特定阴影样式
     */
    shadow: (elevation = 4, opacity = 0.2) => {
        return react_native_1.Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: elevation / 2 },
                shadowOpacity: opacity,
                shadowRadius: elevation,
            },
            android: {
                elevation,
            },
        });
    },
};
