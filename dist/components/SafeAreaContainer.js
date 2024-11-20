"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const platformStyles_1 = require("../utils/platformStyles");
/**
 * 安全区域容器组件
 * 处理不同设备的安全区域和状态栏
 */
const SafeAreaContainer = ({ children, style, statusBarColor, statusBarLight = false, }) => {
    return (<react_native_1.SafeAreaView style={[styles.container, style]}>
      <react_native_1.StatusBar backgroundColor={statusBarColor} barStyle={statusBarLight ? 'light-content' : 'dark-content'} translucent={react_native_1.Platform.OS === 'android'}/>
      {children}
    </react_native_1.SafeAreaView>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ flex: 1, backgroundColor: '#fff' }, platformStyles_1.platformStyles.select({
    // iOS特定样式
    }, {
        // Android特定样式
        paddingTop: react_native_1.StatusBar.currentHeight,
    })),
});
exports.default = SafeAreaContainer;
