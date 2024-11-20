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
/**
 * 键盘感知视图组件
 * 自动处理键盘弹出/收起时的布局调整
 */
const KeyboardAwareView = ({ children, style, enabled = true, extraOffset = 0, }) => {
    const [keyboardSpace, setKeyboardSpace] = (0, react_1.useState)(0);
    const [keyboardShow, setKeyboardShow] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        let keyboardWillShowSub;
        let keyboardWillHideSub;
        let keyboardDidShowSub;
        let keyboardDidHideSub;
        if (enabled) {
            if (react_native_1.Platform.OS === 'ios') {
                keyboardWillShowSub = react_native_1.Keyboard.addListener('keyboardWillShow', onKeyboardShow);
                keyboardWillHideSub = react_native_1.Keyboard.addListener('keyboardWillHide', onKeyboardHide);
            }
            else {
                keyboardDidShowSub = react_native_1.Keyboard.addListener('keyboardDidShow', onKeyboardShow);
                keyboardDidHideSub = react_native_1.Keyboard.addListener('keyboardDidHide', onKeyboardHide);
            }
        }
        return () => {
            if (enabled) {
                if (react_native_1.Platform.OS === 'ios') {
                    keyboardWillShowSub === null || keyboardWillShowSub === void 0 ? void 0 : keyboardWillShowSub.remove();
                    keyboardWillHideSub === null || keyboardWillHideSub === void 0 ? void 0 : keyboardWillHideSub.remove();
                }
                else {
                    keyboardDidShowSub === null || keyboardDidShowSub === void 0 ? void 0 : keyboardDidShowSub.remove();
                    keyboardDidHideSub === null || keyboardDidHideSub === void 0 ? void 0 : keyboardDidHideSub.remove();
                }
            }
        };
    }, [enabled]);
    const onKeyboardShow = (event) => {
        if (!enabled)
            return;
        react_native_1.LayoutAnimation.configureNext(react_native_1.LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardSpace(event.endCoordinates.height + extraOffset);
        setKeyboardShow(true);
    };
    const onKeyboardHide = () => {
        if (!enabled)
            return;
        react_native_1.LayoutAnimation.configureNext(react_native_1.LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardSpace(0);
        setKeyboardShow(false);
    };
    return (<react_native_1.View style={[styles.container, style]}>
      {children}
      {keyboardShow && <react_native_1.View style={{ height: keyboardSpace }}/>}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
});
exports.default = KeyboardAwareView;
