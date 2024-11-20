import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { precise } from '../utils/mathUtils';
import { settingsManager } from '../utils/settingsManager';
import { historyManager } from '../utils/historyManager';
import { UserSettings } from '../types/settings';
import { useAppSettings } from '../hooks/useAppSettings';
import { useInputValidation } from '../hooks/useInputValidation';
import InputErrorMessage from '../components/InputErrorMessage';

const LoanCalculatorScreen: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useAppSettings();
  const {
    validateAll,
    getFieldError,
    clearErrors,
  } = useInputValidation();
  
  // 使用设置中的默认值
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(settings.calculator.defaultRate.toString());
  const [term, setTerm] = useState(settings.calculator.defaultTerm.toString());
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
  });

  // 监听设置变化
  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((newSettings: UserSettings) => {
      // 只在值为空时应用默认值
      if (!rate) setRate(newSettings.calculator.defaultRate.toString());
      if (!term) setTerm(newSettings.calculator.defaultTerm.toString());
    });
    return unsubscribe;
  }, [rate, term]);

  const calculateLoan = async () => {
    clearErrors();
    
    if (!validateAll(amount, rate, term)) {
      return;
    }

    const principal = parseFloat(amount) || 0;
    const annualRate = parseFloat(rate) || 0;
    const years = parseInt(term) || 0;

    if (principal > 0 && annualRate > 0 && years > 0) {
      // 验证输入是否在允许范围内
      if (principal > settings.calculator.maxLoanAmount) {
        // 显示错误提示
        return;
      }

      if (years > settings.calculator.maxTerm) {
        // 显示错误提示
        return;
      }

      const monthlyRate = annualRate / 12 / 100;
      const months = years * 12;
      const monthlyPayment = precise.multiply(
        principal,
        precise.divide(
          monthlyRate,
          1 - Math.pow(1 + monthlyRate, -months)
        )
      );

      const totalPayment = precise.multiply(monthlyPayment, months);
      const totalInterest = precise.subtract(totalPayment, principal);

      const newResults = {
        monthlyPayment,
        totalPayment,
        totalInterest,
      };

      setResults(newResults);

      // 保存计算历史
      if (settings.ui.autoSave) {
        await historyManager.addRecord({
          loanType: settings.calculator.defaultLoanType,
          amount: principal,
          rate: annualRate,
          term: years,
          monthlyPayment,
          totalInterest,
          totalPayment,
          paymentMethod: 'equalPayment',
          schedule: [], // 需要生成完整的还款计划
        });
      }
    }
  };

  // 格式化数字，应用设置中的小数位数
  const formatNumber = (value: number): string => {
    return value.toFixed(settings.calculator.roundingDecimals);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          settings.ui.compactMode && styles.compactContent
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('calculator.title')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('calculator.amount')}</Text>
            <TextInput
              style={[
                styles.input,
                !!getFieldError('amount') && styles.inputError,
              ]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder={t('calculator.amountPlaceholder')}
              placeholderTextColor={theme.colors.text.hint}
              maxLength={settings.calculator.maxInputLength}
            />
            <InputErrorMessage
              message={getFieldError('amount')}
              visible={!!getFieldError('amount')}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('calculator.rate')}</Text>
            <TextInput
              style={[
                styles.input,
                !!getFieldError('rate') && styles.inputError,
              ]}
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              placeholder={t('calculator.ratePlaceholder')}
              placeholderTextColor={theme.colors.text.hint}
            />
            <InputErrorMessage
              message={getFieldError('rate')}
              visible={!!getFieldError('rate')}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('calculator.term')}</Text>
            <TextInput
              style={[
                styles.input,
                !!getFieldError('term') && styles.inputError,
              ]}
              value={term}
              onChangeText={setTerm}
              keyboardType="numeric"
              placeholder={t('calculator.termPlaceholder')}
              placeholderTextColor={theme.colors.text.hint}
            />
            <InputErrorMessage
              message={getFieldError('term')}
              visible={!!getFieldError('term')}
            />
          </View>

          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateLoan}
          >
            <Text style={styles.buttonText}>{t('calculator.calculate')}</Text>
          </TouchableOpacity>
        </View>

        {results.monthlyPayment > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>{t('calculator.results')}</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                {t('calculator.monthlyPayment')}
              </Text>
              <Text style={styles.resultValue}>
                ¥{formatNumber(results.monthlyPayment)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                {t('calculator.totalPayment')}
              </Text>
              <Text style={styles.resultValue}>
                ¥{formatNumber(results.totalPayment)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                {t('calculator.totalInterest')}
              </Text>
              <Text style={[styles.resultValue, styles.interestValue]}>
                ¥{formatNumber(results.totalInterest)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  calculateButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  interestValue: {
    color: theme.colors.primary,
  },
  compactContent: {
    padding: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
});

export default LoanCalculatorScreen; 