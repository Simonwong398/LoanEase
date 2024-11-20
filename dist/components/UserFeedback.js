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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const auditManager_1 = require("../utils/auditManager");
const UserFeedback = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [feedbackType, setFeedbackType] = (0, react_1.useState)('suggestion');
    const [content, setContent] = (0, react_1.useState)('');
    const [contact, setContact] = (0, react_1.useState)('');
    const handleSubmit = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!content.trim()) {
            react_native_1.Alert.alert(t('feedback.error'), t('feedback.contentRequired'));
            return;
        }
        try {
            const feedback = {
                type: feedbackType,
                content: content.trim(),
                contact: contact.trim() || undefined,
            };
            // 记录审计日志
            yield auditManager_1.auditManager.logEvent({
                type: 'feedback',
                action: 'submit',
                status: 'success',
                details: {
                    feedbackType,
                    hasContact: !!contact,
                },
            });
            // TODO: 发送到服务器
            react_native_1.Alert.alert(t('feedback.success'), t('feedback.thankYou'));
            // 重置表单
            setContent('');
            setContact('');
        }
        catch (error) {
            yield auditManager_1.auditManager.logEvent({
                type: 'feedback',
                action: 'submit',
                status: 'failure',
                details: { error: error.message },
                errorMessage: error.message,
            });
            react_native_1.Alert.alert(t('feedback.error'), t('feedback.submitFailed'));
        }
    });
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('feedback.title')}</react_native_1.Text>
      
      <react_native_1.View style={styles.typeSelector}>
        {['bug', 'feature', 'suggestion', 'other'].map(type => (<react_native_1.TouchableOpacity key={type} style={[
                styles.typeButton,
                feedbackType === type && styles.selectedType,
            ]} onPress={() => setFeedbackType(type)}>
            <react_native_1.Text style={[
                styles.typeText,
                feedbackType === type && styles.selectedTypeText,
            ]}>
              {t(`feedback.types.${type}`)}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>))}
      </react_native_1.View>

      <react_native_1.TextInput style={styles.contentInput} multiline numberOfLines={5} placeholder={t('feedback.contentPlaceholder')} value={content} onChangeText={setContent}/>

      <react_native_1.TextInput style={styles.contactInput} placeholder={t('feedback.contactPlaceholder')} value={contact} onChangeText={setContact}/>

      <react_native_1.TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <react_native_1.Text style={styles.submitButtonText}>
          {t('feedback.submit')}
        </react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.md,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme_1.theme.spacing.sm,
        marginBottom: theme_1.theme.spacing.md,
    },
    typeButton: {
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
    },
    selectedType: {
        backgroundColor: theme_1.theme.colors.primary,
        borderColor: theme_1.theme.colors.primary,
    },
    typeText: {
        color: theme_1.theme.colors.text.primary,
    },
    selectedTypeText: {
        color: theme_1.theme.colors.surface,
    },
    contentInput: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.sm,
        marginBottom: theme_1.theme.spacing.md,
        textAlignVertical: 'top',
        color: theme_1.theme.colors.text.primary,
    },
    contactInput: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.sm,
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    submitButton: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
    },
    submitButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = UserFeedback;
