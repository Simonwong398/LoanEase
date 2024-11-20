"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnimation = exports.AnimationPresets = void 0;
const react_native_1 = require("react-native");
const defaultEasing = react_native_1.Easing.bezier(0.4, 0, 0.2, 1);
class AnimationPresets {
    // 淡入淡出
    static fade(value, config) {
        var _a, _b;
        return {
            fadeIn: react_native_1.Animated.timing(value, {
                toValue: 1,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || defaultEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_a = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _a !== void 0 ? _a : true,
            }),
            fadeOut: react_native_1.Animated.timing(value, {
                toValue: 0,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || defaultEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_b = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _b !== void 0 ? _b : true,
            }),
        };
    }
    // 滑动
    static slide(value, config) {
        var _a, _b;
        const distance = (config === null || config === void 0 ? void 0 : config.distance) || 100;
        return {
            slideIn: react_native_1.Animated.timing(value, {
                toValue: 0,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || defaultEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_a = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _a !== void 0 ? _a : true,
            }),
            slideOut: react_native_1.Animated.timing(value, {
                toValue: distance,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || defaultEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_b = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _b !== void 0 ? _b : true,
            }),
        };
    }
    // 缩放
    static scale(value, config) {
        var _a, _b;
        const elasticEasing = react_native_1.Easing.bezier(0.68, -0.55, 0.265, 1.55);
        return {
            scaleIn: react_native_1.Animated.timing(value, {
                toValue: 1,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || elasticEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_a = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _a !== void 0 ? _a : true,
            }),
            scaleOut: react_native_1.Animated.timing(value, {
                toValue: 0,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || elasticEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_b = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _b !== void 0 ? _b : true,
            }),
        };
    }
    // 弹跳
    static bounce(value, config) {
        var _a;
        return react_native_1.Animated.spring(value, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: (_a = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _a !== void 0 ? _a : true,
        });
    }
    // 旋转
    static rotate(value, config) {
        var _a, _b;
        return {
            rotateIn: react_native_1.Animated.timing(value, {
                toValue: 1,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || defaultEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_a = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _a !== void 0 ? _a : true,
            }),
            rotateOut: react_native_1.Animated.timing(value, {
                toValue: 0,
                duration: (config === null || config === void 0 ? void 0 : config.duration) || 300,
                easing: (config === null || config === void 0 ? void 0 : config.easing) || defaultEasing,
                delay: (config === null || config === void 0 ? void 0 : config.delay) || 0,
                useNativeDriver: (_b = config === null || config === void 0 ? void 0 : config.useNativeDriver) !== null && _b !== void 0 ? _b : true,
            }),
        };
    }
    // 序列动画
    static sequence(animations) {
        return react_native_1.Animated.sequence(animations);
    }
    // 并行动画
    static parallel(animations) {
        return react_native_1.Animated.parallel(animations);
    }
    // 交错动画
    static stagger(duration, animations) {
        return react_native_1.Animated.stagger(duration, animations);
    }
    // 循环动画
    static loop(animation, config) {
        return react_native_1.Animated.loop(animation, {
            iterations: config === null || config === void 0 ? void 0 : config.iterations,
        });
    }
    // 自定义动画曲线
    static customTiming(value, config) {
        var _a;
        return react_native_1.Animated.timing(value, {
            toValue: config.toValue,
            duration: config.duration || 300,
            easing: config.easing || defaultEasing,
            delay: config.delay || 0,
            useNativeDriver: (_a = config.useNativeDriver) !== null && _a !== void 0 ? _a : true,
        });
    }
}
exports.AnimationPresets = AnimationPresets;
// 动画Hook
const useAnimation = (initialValue = 0) => {
    const animatedValue = new react_native_1.Animated.Value(initialValue);
    return {
        value: animatedValue,
        fade: (config) => AnimationPresets.fade(animatedValue, config),
        slide: (config) => AnimationPresets.slide(animatedValue, config),
        scale: (config) => AnimationPresets.scale(animatedValue, config),
        bounce: (config) => AnimationPresets.bounce(animatedValue, config),
        rotate: (config) => AnimationPresets.rotate(animatedValue, config),
        custom: (config) => AnimationPresets.customTiming(animatedValue, config),
    };
};
exports.useAnimation = useAnimation;
