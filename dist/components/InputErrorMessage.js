"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const InputErrorMessage = ({ message, visible, }) => {
    const opacity = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    react_1.default.useEffect(() => {
        react_native_1.Animated.timing(opacity, {
            toValue: visible ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [visible]);
    if (!message)
        return null;
    return (<react_native_1.Animated.View style={[styles.container, { opacity }]}>
      <react_native_1.Text style={styles.message}>{message}</react_native_1.Text>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        marginTop: theme_1.theme.spacing.xs,
    },
    message: {
        fontSize: 12,
        color: theme_1.theme.colors.error,
        fontStyle: 'italic',
    },
});
exports.default = InputErrorMessage;
