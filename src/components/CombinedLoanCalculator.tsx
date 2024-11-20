import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import LoanParametersInput from './LoanParametersInput';
import { calculateCombinedLoan } from '../utils/loanCalculations';
import { cityPolicies } from '../config/cityPolicies';
import { useLPRRate } from '../services/lprService';

interface CombinedLoanCalculatorProps {
  cityId: string;
  onCalculate: (results: any) => void;
}

const CombinedLoanCalculator: React.FC<CombinedLoanCalculatorProps> = ({
  cityId,
  onCalculate,
}) => {
  const { t } = useLanguage();
  const { lprData } = useLPRRate();
  const cityPolicy = cityPolicies[cityId];

  const [commercialAmount, setCommercialAmount] = useState('');
  const [commercialRate, setCommercialRate] = useState('');
  const [providentAmount, setProvidentAmount] = useState('');
  const [providentRate, setProvidentRate] = useState(cityPolicy?.providentFund.rate.toString() || '3.1');
  const [term, setTerm] = useState('30');
  const [results, setResults] = useState<any>(null);

  // 根据城市政策自动设置商贷利率
  useEffect(() => {
    if (lprData && cityPolicy) {
      const baseRate = lprData.fiveYear;
      const finalRate = baseRate + cityPolicy.restrictions.firstHome.lprOffset / 100;
      setCommercialRate(finalRate.toFixed(2));
    }
  }, [lprData, cityPolicy]);

  const handleCalculate = () => {
    const results = calculateCombinedLoan(
      {
        amount: parseFloat(commercialAmount) || 0,
        rate: parseFloat(commercialRate) || 0,
      },
      {
        amount: parseFloat(providentAmount) || 0,
        rate: parseFloat(providentRate) || 0,
      },
      parseFloat(term) || 30
    );
    setResults(results);
    onCalculate(results);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('combinedLoan.title')}</Text>
      
      {/* 商业贷款部分 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('loanType.commercialHouse.name')}</Text>
        <LoanParametersInput
          amount={commercialAmount}
          rate={commercialRate}
          term={term}
          onAmountChange={setCommercialAmount}
          onRateChange={setCommercialRate}
          onTermChange={setTerm}
          showTerm={false}
        />
        <Text style={styles.hint}>{t('combinedLoan.commercialHint')}</Text>
      </View>

      {/* 公积金贷款部分 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('loanType.providentFund.name')}</Text>
        <LoanParametersInput
          amount={providentAmount}
          rate={providentRate}
          term={term}
          onAmountChange={setProvidentAmount}
          onRateChange={setProvidentRate}
          onTermChange={setTerm}
          showTerm={false}
          showRate={false}
        />
        <Text style={styles.hint}>
          {t('combinedLoan.providentFundHint', { maxAmount: cityPolicy?.providentFund.maxAmount })}
        </Text>
      </View>

      {/* 贷款期限 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('input.term')}</Text>
        <LoanParametersInput
          amount=""
          rate=""
          term={term}
          onAmountChange={() => {}}
          onRateChange={() => {}}
          onTermChange={setTerm}
          showAmount={false}
          showRate={false}
        />
      </View>

      <TouchableOpacity 
        style={styles.calculateButton}
        onPress={handleCalculate}
      >
        <Text style={styles.calculateButtonText}>
          {t('combinedLoan.calculate')}
        </Text>
      </TouchableOpacity>

      {/* 计算结果 */}
      {results && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{t('combinedLoan.commercialPayment')}</Text>
            <Text style={styles.resultValue}>
              ¥{results.commercial.monthlyPayment.toFixed(2)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{t('combinedLoan.providentFundPayment')}</Text>
            <Text style={styles.resultValue}>
              ¥{results.providentFund.monthlyPayment.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.resultRow, styles.totalRow]}>
            <Text style={styles.resultLabel}>{t('combinedLoan.totalMonthly')}</Text>
            <Text style={[styles.resultValue, styles.totalValue]}>
              ¥{results.combined.monthlyPayment.toFixed(2)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{t('combinedLoan.totalInterest')}</Text>
            <Text style={styles.resultValue}>
              ¥{results.combined.totalInterest.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  calculateButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  calculateButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  resultLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  resultValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default CombinedLoanCalculator; 