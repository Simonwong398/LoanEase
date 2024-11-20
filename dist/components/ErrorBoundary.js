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
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.handleRetry = () => {
            this.setState({
                hasError: false,
                error: null,
            });
        };
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        var _a, _b;
        (_b = (_a = this.props).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error, errorInfo);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (<react_native_1.View style={styles.container}>
          <react_native_1.Text style={styles.title}>出错了</react_native_1.Text>
          <react_native_1.Text style={styles.message}>
            {((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || '发生了未知错误'}
          </react_native_1.Text>
          <react_native_1.TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <react_native_1.Text style={styles.retryText}>重试</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>);
        }
        return this.props.children;
    }
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme_1.theme.spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.md,
    },
    message: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme_1.theme.spacing.lg,
    },
    retryButton: {
        backgroundColor: theme_1.theme.colors.primary,
        paddingHorizontal: theme_1.theme.spacing.lg,
        paddingVertical: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    retryText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = ErrorBoundary;
