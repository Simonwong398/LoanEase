"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessibility = void 0;
const react_native_1 = require("react-native");
/**
 * 可访问性工具函数
 */
exports.accessibility = {
    /**
     * 检查屏幕阅读器是否启用
     */
    isScreenReaderEnabled: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield react_native_1.AccessibilityInfo.isScreenReaderEnabled();
    }),
    /**
     * 获取推荐的最小触摸目标尺寸
     */
    getMinimumTouchSize: () => {
        return react_native_1.Platform.select({
            ios: { width: 44, height: 44 },
            android: { width: 48, height: 48 },
            default: { width: 44, height: 44 },
        });
    },
    /**
     * 检查颜色对比度是否符合WCAG标准
     * @param foreground 前景色
     * @param background 背景色
     * @returns 是否符合标准
     */
    checkColorContrast: (foreground, background) => {
        // 将颜色转换为亮度值
        const getLuminance = (color) => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;
            const toLinear = (value) => {
                return value <= 0.03928
                    ? value / 12.92
                    : Math.pow((value + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };
        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        return ratio >= 4.5; // WCAG AA标准
    },
    /**
     * 生成可访问性标签
     */
    generateA11yLabel: (label, role, state) => {
        let fullLabel = label;
        if (role) {
            fullLabel += `, ${role}`;
        }
        if (state) {
            Object.entries(state).forEach(([key, value]) => {
                if (value) {
                    fullLabel += `, ${key}`;
                }
            });
        }
        return fullLabel;
    },
};
