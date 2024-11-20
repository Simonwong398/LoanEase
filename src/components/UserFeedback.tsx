import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { auditManager } from '../utils/auditManager';

interface FeedbackData {
  type: 'bug' | 'feature' | 'suggestion' | 'other';
  content: string;
  contact?: string;
}

const UserFeedback: React.FC = () => {
  const { t } = useLanguage();
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('suggestion');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert(t('feedback.error'), t('feedback.contentRequired'));
      return;
    }

    try {
      const feedback: FeedbackData = {
        type: feedbackType,
        content: content.trim(),
        contact: contact.trim() || undefined,
      };

      // 记录审计日志
      await auditManager.logEvent({
        type: 'feedback',
        action: 'submit',
        status: 'success',
        details: {
          feedbackType,
          hasContact: !!contact,
        },
      });

      // TODO: 发送到服务器
      Alert.alert(t('feedback.success'), t('feedback.thankYou'));
      
      // 重置表单
      setContent('');
      setContact('');
    } catch (error) {
      await auditManager.logEvent({
        type: 'feedback',
        action: 'submit',
        status: 'failure',
        details: { error: error.message },
        errorMessage: error.message,
      });
      Alert.alert(t('feedback.error'), t('feedback.submitFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('feedback.title')}</Text>
      
      <View style={styles.typeSelector}>
        {(['bug', 'feature', 'suggestion', 'other'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              feedbackType === type && styles.selectedType,
            ]}
            onPress={() => setFeedbackType(type)}
          >
            <Text style={[
              styles.typeText,
              feedbackType === type && styles.selectedTypeText,
            ]}>
              {t(`feedback.types.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.contentInput}
        multiline
        numberOfLines={5}
        placeholder={t('feedback.contentPlaceholder')}
        value={content}
        onChangeText={setContent}
      />

      <TextInput
        style={styles.contactInput}
        placeholder={t('feedback.contactPlaceholder')}
        value={contact}
        onChangeText={setContact}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>
          {t('feedback.submit')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedType: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.text.primary,
  },
  selectedTypeText: {
    color: theme.colors.surface,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    textAlignVertical: 'top',
    color: theme.colors.text.primary,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  submitButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserFeedback; 