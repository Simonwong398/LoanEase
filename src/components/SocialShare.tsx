import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert, AccessibilityRole } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { auditManager } from '../utils/auditManager';
import { formatCurrency } from '../utils/formatters';
import { LoanResult } from '../types/loan';
import { errorManager } from '../utils/errorHandling';

interface SocialShareProps {
  loanResult: LoanResult;
  onShareComplete?: (success: boolean) => void;
}

const SocialShare: React.FC<SocialShareProps> = memo(({ loanResult, onShareComplete }) => {
  const { t } = useLanguage();

  const generateShareContent = useCallback(() => {
    try {
      return `
${t('share.title')}

${t('share.loanAmount')}: ${formatCurrency(loanResult.amount)}
${t('share.monthlyPayment')}: ${formatCurrency(loanResult.monthlyPayment)}
${t('share.totalInterest')}: ${formatCurrency(loanResult.totalInterest)}
${t('share.totalPayment')}: ${formatCurrency(loanResult.totalPayment)}

${t('share.calculatedWith')} #LoanEase
      `.trim();
    } catch (error) {
      errorManager.handleError(error);
      return '';
    }
  }, [loanResult, t]);

  const handleShare = useCallback(async (platform?: string) => {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 10000); // 10秒超时

    try {
      const result = await Share.share({
        message: generateShareContent(),
        title: t('share.title'),
        url: Platform.select({
          ios: 'https://apps.apple.com/app/loanease',
          android: 'https://play.google.com/store/apps/details?id=com.loanease',
          default: 'https://loanease.app',
        }),
      });

      if (result.action !== Share.dismissedAction) {
        await auditManager.logEvent({
          type: 'share',
          action: 'success',
          status: 'success',
          details: {
            platform,
            loanAmount: loanResult.amount,
          },
        });
        onShareComplete?.(true);
      }
    } catch (error) {
      await auditManager.logEvent({
        type: 'share',
        action: 'failure',
        status: 'failure',
        details: {
          platform,
          error: error.message,
        },
        errorMessage: error.message,
      });
      
      Alert.alert(
        t('share.error.title'),
        t('share.error.message'),
        [{ text: t('common.ok') }]
      );
      
      onShareComplete?.(false);
      errorManager.handleError(error);
    } finally {
      clearTimeout(timeout);
    }
  }, [generateShareContent, loanResult.amount, t, onShareComplete]);

  return (
    <View 
      style={styles.container} 
      accessibilityRole={'contentInfo' as AccessibilityRole}
      accessibilityLabel={t('share.title')}
    >
      <Text 
        style={styles.title} 
        accessibilityRole={'header' as AccessibilityRole}
        accessibilityLabel={t('share.shareResult')}
      >
        {t('share.shareResult')}
      </Text>
      
      <View style={styles.previewContainer}>
        <Text 
          style={styles.previewText}
          accessibilityLabel={t('share.preview')}
          accessibilityHint={t('share.previewHint')}
        >
          {generateShareContent()}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleShare()}
          accessibilityRole="button"
          accessibilityLabel={t('share.share')}
          accessibilityHint={t('share.shareHint')}
        >
          <Text style={styles.shareButtonText}>
            {t('share.share')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  previewContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  previewText: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  shareButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

SocialShare.displayName = 'SocialShare';

export default SocialShare; 