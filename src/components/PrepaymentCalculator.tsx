import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import LoanParametersInput from './LoanParametersInput';
import { calculateWithPrepayment, PaymentMethod } from '../utils/loanCalculations';
import DetailedRepaymentSchedule from './DetailedRepaymentSchedule';

interface PrepaymentCalculatorProps {
  originalLoan: {
    principal: number;
    rate: number;
    term: number;
    monthlyPayment: number;
  };
}

const PrepaymentCalculator: React.FC<PrepaymentCalculatorProps> = ({
  originalLoan,
}) => {
  const { t } = useLanguage();
  const [prepaymentAmount, setPrepaymentAmount] = useState('');
  const [prepaymentMonth, setPrepaymentMonth] = useState('12');
  const [reduceTerm, setReduceTerm] = useState(true);
  const [results, setResults] = useState<{
    prepaymentPlan: PaymentMethod;
    savings: {
      interest: number;
      months: number;
    };
  } | null>(null);

  const calculatePrepayment = () => {
    const amount = parseFloat(prepaymentAmount);
    const month = parseInt(prepaymentMonth);

    if (amount > 0 && month > 0) {
      const prepaymentResult = calculateWithPrepayment(
        originalLoan.principal,
        originalLoan.rate,
        originalLoan.term,
        {
          amount,
          month,
          method: reduceTerm ? 'reduce_term' : 'reduce_payment'
        }
      );

      // 计算节省的利息
      const originalTotalPayment = originalLoan.monthlyPayment * originalLoan.term * 12;
      const savedInterest = originalTotalPayment - prepaymentResult.totalPayment;
      
      // 计算减少的月数（如果选择缩短期限）
      const savedMonths = reduceTerm ? 
        (originalLoan.term * 12 - prepaymentResult.schedule.length) : 0;

      setResults({
        prepaymentPlan: prepaymentResult,
        savings: {
          interest: savedInterest,
          months: savedMonths
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('prepayment.title')}</Text>

      {/* 提前还款输入部分 */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>{t('prepayment.input')}</Text>
        <LoanParametersInput
          amount={prepaymentAmount}
          rate=""
          term={prepaymentMonth}
          onAmountChange={setPrepaymentAmount}
          onRateChange={() => {}}
          onTermChange={setPrepaymentMonth}
          showRate={false}
          showTerm={true}
          termLabel={t('prepayment.monthLabel')}
        />
      </View>

      {/* 还款方式选择 */}
      <View style={styles.optionSection}>
        <Text style={styles.sectionTitle}>{t('prepayment.method')}</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.optionText}>
            {t(reduceTerm ? 'prepayment.reduceTerm' : 'prepayment.reducePayment')}
          </Text>
          <Switch
            value={reduceTerm}
            onValueChange={setReduceTerm}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.calculateButton}
        onPress={calculatePrepayment}
      >
        <Text style={styles.calculateButtonText}>
          {t('prepayment.calculate')}
        </Text>
      </TouchableOpacity>

      {/* 计算结果展示 */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>{t('prepayment.results')}</Text>
          
          {/* 节省情况 */}
          <View style={styles.savingsContainer}>
            <View style={styles.savingItem}>
              <Text style={styles.savingLabel}>{t('prepayment.savedInterest')}</Text>
              <Text style={[styles.savingValue, styles.highlight]}>
                ¥{results.savings.interest.toFixed(2)}
              </Text>
            </View>
            {reduceTerm && results.savings.months > 0 && (
              <View style={styles.savingItem}>
                <Text style={styles.savingLabel}>{t('prepayment.savedMonths')}</Text>
                <Text style={[styles.savingValue, styles.highlight]}>
                  {results.savings.months} {t('prepayment.months')}
                </Text>
              </View>
            )}
          </View>

          {/* 新的还款计划 */}
          <View style={styles.scheduleContainer}>
            <Text style={styles.sectionTitle}>{t('prepayment.newSchedule')}</Text>
            <DetailedRepaymentSchedule
              schedule={results.prepaymentPlan.schedule}
              totalAmount={originalLoan.principal}
              totalInterest={results.prepaymentPlan.totalInterest}
            />
          </View>
        </View>
      )}

      <Text style={styles.note}>{t('prepayment.note')}</Text>
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  optionSection: {
    marginBottom: theme.spacing.lg,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  calculateButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  calculateButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: theme.spacing.lg,
  },
  savingsContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
  },
  savingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  savingLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  savingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  highlight: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scheduleContainer: {
    marginTop: theme.spacing.lg,
  },
  note: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
});

export default PrepaymentCalculator; 