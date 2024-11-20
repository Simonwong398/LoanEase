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
exports.withAccessibility = withAccessibility;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const accessibility_1 = require("../utils/accessibility");
function withAccessibility(WrappedComponent) {
    return function AccessibleComponent(props) {
        const { label, role, state, hint } = props, rest = __rest(props, ["label", "role", "state", "hint"]);
        const accessibilityProps = Object.assign({ accessible: true, accessibilityLabel: label
                ? accessibility_1.accessibility.generateA11yLabel(label, role, state)
                : undefined, accessibilityRole: role, accessibilityHint: hint, accessibilityState: state }, react_native_1.Platform.select({
            ios: {
                accessibilityElementsHidden: false,
                importantForAccessibility: 'yes',
            },
            android: {
                importantForAccessibility: 'yes',
            },
        }));
        return <WrappedComponent {...rest} {...accessibilityProps}/>;
    };
}
