import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, RadarChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { HistoricalAnalysis } from '../utils/loanPlanRecommender';

interface LoanTrendAnalysisProps {
  analysis: HistoricalAnalysis;
  showRadar?: boolean;
}

type TrendKey = keyof HistoricalAnalysis['trendAnalysis'];

const LoanTrendAnalysis: React.FC<LoanTrendAnalysisProps> = ({
  analysis,
  showRadar = true,
}) => {
  const { t } = useLanguage();
  const screenWidth = Dimensions.get('window').width;

  // 趋势图数据
  const trendData = {
    labels: [t('trend.monthlyBurden'), t('trend.totalInterest'), t('trend.flexibility')],
    datasets: [{
      data: [
        analysis.trendAnalysis.monthlyBurdenTrend,
        analysis.trendAnalysis.totalInterestTrend,
        analysis.trendAnalysis.flexibilityTrend,
      ],
    }],
  };

  // 趋势评估
  const getTrendEvaluation = (trend: number, type: TrendKey): {
    status: 'good' | 'warning' | 'bad';
    message: string;
  } => {
    switch (type) {
      case 'monthlyBurdenTrend':
        return {
          status: trend < 0 ? 'good' : trend < 10 ? 'warning' : 'bad',
          message: trend < 0 ? 
            t('trend.monthlyBurden.decreased') :
            trend < 10 ?
              t('trend.monthlyBurden.stable') :
              t('trend.monthlyBurden.increased'),
        };
      case 'totalInterestTrend':
        return {
          status: trend < -5 ? 'good' : trend < 5 ? 'warning' : 'bad',
          message: trend < -5 ?
            t('trend.totalInterest.decreased') :
            trend < 5 ?
              t('trend.totalInterest.stable') :
              t('trend.totalInterest.increased'),
        };
      case 'flexibilityTrend':
        return {
          status: trend > 10 ? 'good' : trend > -10 ? 'warning' : 'bad',
          message: trend > 10 ?
            t('trend.flexibility.increased') :
            trend > -10 ?
              t('trend.flexibility.stable') :
              t('trend.flexibility.decreased'),
        };
      default:
        return { status: 'warning', message: '' };
    }
  };

  // 优化趋势计算：添加趋势强度评估
  const getTrendStrength = (trend: number): 'strong' | 'moderate' | 'weak' => {
    const absValue = Math.abs(trend);
    if (absValue > 20) return 'strong';
    if (absValue > 10) return 'moderate';
    return 'weak';
  };

  // 优化趋势分析：添加趋势组合评估
  const getOverallTrendAssessment = () => {
    const trends = [
      analysis.trendAnalysis.monthlyBurdenTrend,
      analysis.trendAnalysis.totalInterestTrend,
      analysis.trendAnalysis.flexibilityTrend,
    ];

    const avgTrend = trends.reduce((sum, t) => sum + t, 0) / trends.length;
    const variance = trends.reduce((sum, t) => sum + Math.pow(t - avgTrend, 2), 0) / trends.length;
    const volatility = Math.sqrt(variance);

    return {
      direction: avgTrend > 0 ? 'increasing' : 'decreasing',
      volatility: volatility > 15 ? 'high' : volatility > 7 ? 'medium' : 'low',
      consistency: variance < 25 ? 'consistent' : 'mixed',
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('trend.analysis.title')}</Text>

      {/* 趋势图表 */}
      <View style={styles.chartContainer}>
        {showRadar ? (
          <RadarChart
            data={trendData}
            width={screenWidth - theme.spacing.lg * 2}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            }}
            style={styles.chart}
          />
        ) : (
          <LineChart
            data={trendData}
            width={screenWidth - theme.spacing.lg * 2}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* 趋势评估 */}
      <View style={styles.evaluationContainer}>
        {(Object.entries(analysis.trendAnalysis) as [TrendKey, number][]).map(([key, value]) => {
          const evaluation = getTrendEvaluation(value, key);
          const strength = getTrendStrength(value);
          return (
            <View key={key} style={styles.evaluationItem}>
              <View style={styles.evaluationHeader}>
                <Text style={styles.evaluationTitle}>
                  {t(`trend.${key}`)}
                </Text>
                <View style={[
                  styles.statusIndicator,
                  styles[`${evaluation.status}Status`],
                  styles[`${strength}Strength`]
                ]} />
              </View>
              <Text style={styles.trendValue}>
                {value > 0 ? '+' : ''}{value.toFixed(1)}%
              </Text>
              <Text style={styles.evaluationMessage}>
                {evaluation.message}
              </Text>
              <Text style={styles.strengthIndicator}>
                {t(`trend.strength.${strength}`)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 添加整体趋势评估 */}
      <View style={styles.overallAssessment}>
        <Text style={styles.sectionTitle}>{t('trend.overall')}</Text>
        {(() => {
          const assessment = getOverallTrendAssessment();
          return (
            <View style={styles.assessmentContent}>
              <Text style={styles.assessmentText}>
                {t(`trend.overall.${assessment.direction}`)}
              </Text>
              <Text style={styles.assessmentText}>
                {t(`trend.volatility.${assessment.volatility}`)}
              </Text>
              <Text style={styles.assessmentText}>
                {t(`trend.consistency.${assessment.consistency}`)}
              </Text>
            </View>
          );
        })()}
      </View>

      {/* 建议列表 */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>{t('trend.recommendations')}</Text>
        {analysis.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>• {recommendation}</Text>
          </View>
        ))}
      </View>

      {/* 平均分对比 */}
      <View style={styles.scoreComparison}>
        <Text style={styles.sectionTitle}>{t('trend.scoreComparison')}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>{t('trend.averageScore')}</Text>
          <Text style={styles.scoreValue}>{analysis.averageScore.toFixed(2)}</Text>
        </View>
      </View>
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
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  chartContainer: {
    marginBottom: theme.spacing.lg,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
  evaluationContainer: {
    marginBottom: theme.spacing.lg,
  },
  evaluationItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  evaluationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  goodStatus: {
    backgroundColor: theme.colors.success,
  },
  warningStatus: {
    backgroundColor: theme.colors.warning,
  },
  badStatus: {
    backgroundColor: theme.colors.error,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  evaluationMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  recommendationsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  recommendationItem: {
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  scoreComparison: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  strengthIndicator: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  strongStrength: {
    borderWidth: 2,
  },
  moderateStrength: {
    borderWidth: 1,
  },
  weakStrength: {
    opacity: 0.7,
  },
  overallAssessment: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    margin: theme.spacing.md,
  },
  assessmentContent: {
    gap: theme.spacing.sm,
  },
  assessmentText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default LoanTrendAnalysis; 