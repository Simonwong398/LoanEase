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
const theme_1 = require("../theme/theme");
const ActionHint = ({ message, icon, duration = 3000, position = 'bottom', onDismiss, }) => {
    const translateY = (0, react_1.useRef)(new react_native_1.Animated.Value(position === 'top' ? -100 : 100)).current;
    const opacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
        if (duration > 0) {
            const timer = setTimeout(dismiss, duration);
            return () => clearTimeout(timer);
        }
    }, []);
    const dismiss = () => {
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(translateY, {
                toValue: position === 'top' ? -100 : 100,
                duration: 300,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss === null || onDismiss === void 0 ? void 0 : onDismiss();
        });
    };
    return (<react_native_1.TouchableWithoutFeedback onPress={dismiss}>
      <react_native_1.Animated.View style={[
            styles.container,
            position === 'top' ? styles.top : styles.bottom,
            {
                transform: [{ translateY }],
                opacity,
            },
        ]}>
        {icon && <react_native_1.Text style={styles.icon}>{icon}</react_native_1.Text>}
        <react_native_1.Text style={styles.message}>{message}</react_native_1.Text>
      </react_native_1.Animated.View>
    </react_native_1.TouchableWithoutFeedback>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ position: 'absolute', left: theme_1.theme.spacing.md, right: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md, flexDirection: 'row', alignItems: 'center' }, theme_1.theme.shadows.medium),
    top: {
        top: theme_1.theme.spacing.xl,
    },
    bottom: {
        bottom: theme_1.theme.spacing.xl,
    },
    icon: {
        fontSize: 24,
        marginRight: theme_1.theme.spacing.sm,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = ActionHint;
