"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const FeedbackButton = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const handleFeedback = () => {
        // 这里可以替换成您的反馈邮箱或反馈表单链接
        react_native_1.Linking.openURL('mailto:feedback@example.com');
    };
    return (<react_native_1.TouchableOpacity style={styles.button} onPress={handleFeedback}>
      <react_native_1.Text style={styles.buttonText}>{t('feedback.button')}</react_native_1.Text>
    </react_native_1.TouchableOpacity>);
};
const styles = react_native_1.StyleSheet.create({
    button: Object.assign({ backgroundColor: theme_1.theme.colors.primary, padding: theme_1.theme.spacing.md, borderRadius: theme_1.theme.borderRadius.md, alignItems: 'center', margin: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    buttonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = FeedbackButton;
