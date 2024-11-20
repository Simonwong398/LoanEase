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
const i18n_1 = require("../i18n");
/**
 * RTL 支持的 View 组件
 */
const RTLView = (_a) => {
    var { children, style, reverse = false } = _a, props = __rest(_a, ["children", "style", "reverse"]);
    const { isRTL } = (0, i18n_1.useLocale)();
    const shouldReverse = reverse ? !isRTL : isRTL;
    return (<react_native_1.View {...props} style={[
            shouldReverse && styles.reverse,
            style,
        ]}>
      {children}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    reverse: {
        flexDirection: 'row-reverse',
    },
});
exports.default = RTLView;
