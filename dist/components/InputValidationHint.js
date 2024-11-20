"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const InputValidationHint = ({ message, type = 'error', visible, }) => {
    const opacity = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    react_1.default.useEffect(() => {
        react_native_1.Animated.timing(opacity, {
            toValue: visible ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [visible]);
    const getIndicatorColor = () => {
        switch (type) {
            case 'error':
                return theme_1.theme.colors.error;
            case 'warning':
                return theme_1.theme.colors.warning;
            case 'success':
                return theme_1.theme.colors.success;
            case 'info':
                return theme_1.theme.colors.primary;
            default:
                return theme_1.theme.colors.error;
        }
    };
    const getMessageColor = () => {
        switch (type) {
            case 'error':
                return theme_1.theme.colors.error;
            case 'warning':
                return theme_1.theme.colors.warning;
            case 'success':
                return theme_1.theme.colors.success;
            case 'info':
                return theme_1.theme.colors.primary;
            default:
                return theme_1.theme.colors.error;
        }
    };
    if (!visible)
        return null;
    return (<react_native_1.Animated.View style={[styles.container, { opacity }]}>
      <react_native_1.View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]}/>
      <react_native_1.Text style={[styles.message, { color: getMessageColor() }]}>
        {message}
      </react_native_1.Text>
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.xs,
        paddingHorizontal: theme_1.theme.spacing.sm,
    },
    indicator: {
        width: 4,
        height: 16,
        borderRadius: 2,
        marginRight: theme_1.theme.spacing.sm,
    },
    message: {
        fontSize: 12,
        flex: 1,
    },
});
exports.default = InputValidationHint;
