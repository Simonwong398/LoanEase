import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

const FeedbackButton: React.FC = () => {
  const { t } = useLanguage();

  const handleFeedback = () => {
    // 这里可以替换成您的反馈邮箱或反馈表单链接
    Linking.openURL('mailto:feedback@example.com');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleFeedback}>
      <Text style={styles.buttonText}>{t('feedback.button')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    margin: theme.spacing.md,
    ...theme.shadows.small,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackButton; 