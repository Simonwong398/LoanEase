import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { cityPolicies } from '../config/cityPolicies';

interface EligibilityCheckerProps {
  cityId: string;
  onEligibilityChange: (isEligible: boolean) => void;
}

interface EligibilityQuestion {
  id: string;
  question: string;
  required: boolean;
}

const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  cityId,
  onEligibilityChange,
}) => {
  const { t } = useLanguage();
  const cityPolicy = cityPolicies[cityId];

  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const questions: EligibilityQuestion[] = [
    {
      id: 'hukou',
      question: t('eligibility.questions.hukou'),
      required: true
    },
    {
      id: 'socialSecurity',
      question: t('eligibility.questions.socialSecurity'),
      required: true
    },
    {
      id: 'marriage',
      question: t('eligibility.questions.marriage'),
      required: false
    },
    {
      id: 'existingProperty',
      question: t('eligibility.questions.existingProperty'),
      required: true
    }
  ];

  const handleAnswerChange = (questionId: string, value: boolean) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // 检查资格
    const isEligible = questions.every(q => 
      !q.required || newAnswers[q.id] === true
    );
    onEligibilityChange(isEligible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('eligibility.title')}</Text>
      <Text style={styles.subtitle}>
        {t('eligibility.cityRequirement', { city: cityPolicy.name })}
      </Text>

      {questions.map(q => (
        <View key={q.id} style={styles.questionContainer}>
          <Text style={styles.question}>
            {q.question}
            {q.required && <Text style={styles.required}> *</Text>}
          </Text>
          <Switch
            value={answers[q.id] || false}
            onValueChange={(value) => handleAnswerChange(q.id, value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      ))}

      <Text style={styles.note}>
        {t('eligibility.note')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  question: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.md,
  },
  required: {
    color: theme.colors.error,
  },
  note: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
});

export default EligibilityChecker; 