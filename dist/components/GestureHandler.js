"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const GestureHandler = (_a) => {
    var { children, style, enabled = true, swipeThreshold = 50 } = _a, gestureConfig = __rest(_a, ["children", "style", "enabled", "swipeThreshold"]);
    const panResponder = react_1.default.useMemo(() => react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderMove: (_, gestureState) => {
            const { dx, dy } = gestureState;
            if (Math.abs(dx) > swipeThreshold) {
                if (dx > 0 && gestureConfig.onSwipeRight) {
                    gestureConfig.onSwipeRight();
                }
                else if (dx < 0 && gestureConfig.onSwipeLeft) {
                    gestureConfig.onSwipeLeft();
                }
            }
            if (Math.abs(dy) > swipeThreshold) {
                if (dy > 0 && gestureConfig.onSwipeDown) {
                    gestureConfig.onSwipeDown();
                }
                else if (dy < 0 && gestureConfig.onSwipeUp) {
                    gestureConfig.onSwipeUp();
                }
            }
        },
    }), [enabled, swipeThreshold, gestureConfig]);
    return (<react_native_1.View style={style} {...panResponder.panHandlers}>
      {children}
    </react_native_1.View>);
};
exports.default = GestureHandler;
