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
const formatters_1 = require("../utils/formatters");
const errorHandling_1 = require("../utils/errorHandling");
const SocialShare = (0, react_1.memo)(({ loanResult, onShareComplete }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const generateShareContent = (0, react_1.useCallback)(() => {
        try {
            return `
${t('share.title')}

${t('share.loanAmount')}: ${(0, formatters_1.formatCurrency)(loanResult.amount)}
${t('share.monthlyPayment')}: ${(0, formatters_1.formatCurrency)(loanResult.monthlyPayment)}
${t('share.totalInterest')}: ${(0, formatters_1.formatCurrency)(loanResult.totalInterest)}
${t('share.totalPayment')}: ${(0, formatters_1.formatCurrency)(loanResult.totalPayment)}

${t('share.calculatedWith')} #LoanEase
      `.trim();
        }
        catch (error) {
            errorHandling_1.errorManager.handleError(error);
            return '';
        }
    }, [loanResult, t]);
    const handleShare = (0, react_1.useCallback)((platform) => __awaiter(void 0, void 0, void 0, function* () {
        const abortController = new AbortController();
        const timeout = setTimeout(() => abortController.abort(), 10000); // 10秒超时
        try {
            const result = yield react_native_1.Share.share({
                message: generateShareContent(),
                title: t('share.title'),
                url: react_native_1.Platform.select({
                    ios: 'https://apps.apple.com/app/loanease',
                    android: 'https://play.google.com/store/apps/details?id=com.loanease',
                    default: 'https://loanease.app',
                }),
            });
            if (result.action !== react_native_1.Share.dismissedAction) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'share',
                    action: 'success',
                    status: 'success',
                    details: {
                        platform,
                        loanAmount: loanResult.amount,
                    },
                });
                onShareComplete === null || onShareComplete === void 0 ? void 0 : onShareComplete(true);
            }
        }
        catch (error) {
            yield auditManager_1.auditManager.logEvent({
                type: 'share',
                action: 'failure',
                status: 'failure',
                details: {
                    platform,
                    error: error.message,
                },
                errorMessage: error.message,
            });
            react_native_1.Alert.alert(t('share.error.title'), t('share.error.message'), [{ text: t('common.ok') }]);
            onShareComplete === null || onShareComplete === void 0 ? void 0 : onShareComplete(false);
            errorHandling_1.errorManager.handleError(error);
        }
        finally {
            clearTimeout(timeout);
        }
    }), [generateShareContent, loanResult.amount, t, onShareComplete]);
    return (<react_native_1.View style={styles.container} accessibilityRole={'contentInfo'} accessibilityLabel={t('share.title')}>
      <react_native_1.Text style={styles.title} accessibilityRole={'header'} accessibilityLabel={t('share.shareResult')}>
        {t('share.shareResult')}
      </react_native_1.Text>
      
      <react_native_1.View style={styles.previewContainer}>
        <react_native_1.Text style={styles.previewText} accessibilityLabel={t('share.preview')} accessibilityHint={t('share.previewHint')}>
          {generateShareContent()}
        </react_native_1.Text>
      </react_native_1.View>

      <react_native_1.View style={styles.buttonContainer}>
        <react_native_1.TouchableOpacity style={styles.shareButton} onPress={() => handleShare()} accessibilityRole="button" accessibilityLabel={t('share.share')} accessibilityHint={t('share.shareHint')}>
          <react_native_1.Text style={styles.shareButtonText}>
            {t('share.share')}
          </react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.View>);
});
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.md,
    },
    previewContainer: {
        backgroundColor: theme_1.theme.colors.background,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        marginBottom: theme_1.theme.spacing.md,
    },
    previewText: {
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme_1.theme.spacing.md,
    },
    shareButton: {
        backgroundColor: theme_1.theme.colors.primary,
        paddingHorizontal: theme_1.theme.spacing.lg,
        paddingVertical: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    shareButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
SocialShare.displayName = 'SocialShare';
exports.default = SocialShare;
