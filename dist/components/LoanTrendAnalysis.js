"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_chart_kit_1 = require("react-native-chart-kit");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanTrendAnalysis = ({ analysis, showRadar = true, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const screenWidth = react_native_1.Dimensions.get('window').width;
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
    const getTrendEvaluation = (trend, type) => {
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
    const getTrendStrength = (trend) => {
        const absValue = Math.abs(trend);
        if (absValue > 20)
            return 'strong';
        if (absValue > 10)
            return 'moderate';
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
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('trend.analysis.title')}</react_native_1.Text>

      {/* 趋势图表 */}
      <react_native_1.View style={styles.chartContainer}>
        {showRadar ? (<react_native_chart_kit_1.RadarChart data={trendData} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
                backgroundColor: theme_1.theme.colors.surface,
                backgroundGradientFrom: theme_1.theme.colors.surface,
                backgroundGradientTo: theme_1.theme.colors.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            }} style={styles.chart}/>) : (<react_native_chart_kit_1.LineChart data={trendData} width={screenWidth - theme_1.theme.spacing.lg * 2} height={220} chartConfig={{
                backgroundColor: theme_1.theme.colors.surface,
                backgroundGradientFrom: theme_1.theme.colors.surface,
                backgroundGradientTo: theme_1.theme.colors.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            }} bezier style={styles.chart}/>)}
      </react_native_1.View>

      {/* 趋势评估 */}
      <react_native_1.View style={styles.evaluationContainer}>
        {Object.entries(analysis.trendAnalysis).map(([key, value]) => {
            const evaluation = getTrendEvaluation(value, key);
            const strength = getTrendStrength(value);
            return (<react_native_1.View key={key} style={styles.evaluationItem}>
              <react_native_1.View style={styles.evaluationHeader}>
                <react_native_1.Text style={styles.evaluationTitle}>
                  {t(`trend.${key}`)}
                </react_native_1.Text>
                <react_native_1.View style={[
                    styles.statusIndicator,
                    styles[`${evaluation.status}Status`],
                    styles[`${strength}Strength`]
                ]}/>
              </react_native_1.View>
              <react_native_1.Text style={styles.trendValue}>
                {value > 0 ? '+' : ''}{value.toFixed(1)}%
              </react_native_1.Text>
              <react_native_1.Text style={styles.evaluationMessage}>
                {evaluation.message}
              </react_native_1.Text>
              <react_native_1.Text style={styles.strengthIndicator}>
                {t(`trend.strength.${strength}`)}
              </react_native_1.Text>
            </react_native_1.View>);
        })}
      </react_native_1.View>

      {/* 添加整体趋势评估 */}
      <react_native_1.View style={styles.overallAssessment}>
        <react_native_1.Text style={styles.sectionTitle}>{t('trend.overall')}</react_native_1.Text>
        {(() => {
            const assessment = getOverallTrendAssessment();
            return (<react_native_1.View style={styles.assessmentContent}>
              <react_native_1.Text style={styles.assessmentText}>
                {t(`trend.overall.${assessment.direction}`)}
              </react_native_1.Text>
              <react_native_1.Text style={styles.assessmentText}>
                {t(`trend.volatility.${assessment.volatility}`)}
              </react_native_1.Text>
              <react_native_1.Text style={styles.assessmentText}>
                {t(`trend.consistency.${assessment.consistency}`)}
              </react_native_1.Text>
            </react_native_1.View>);
        })()}
      </react_native_1.View>

      {/* 建议列表 */}
      <react_native_1.View style={styles.recommendationsContainer}>
        <react_native_1.Text style={styles.sectionTitle}>{t('trend.recommendations')}</react_native_1.Text>
        {analysis.recommendations.map((recommendation, index) => (<react_native_1.View key={index} style={styles.recommendationItem}>
            <react_native_1.Text style={styles.recommendationText}>• {recommendation}</react_native_1.Text>
          </react_native_1.View>))}
      </react_native_1.View>

      {/* 平均分对比 */}
      <react_native_1.View style={styles.scoreComparison}>
        <react_native_1.Text style={styles.sectionTitle}>{t('trend.scoreComparison')}</react_native_1.Text>
        <react_native_1.View style={styles.scoreContainer}>
          <react_native_1.Text style={styles.scoreLabel}>{t('trend.averageScore')}</react_native_1.Text>
          <react_native_1.Text style={styles.scoreValue}>{analysis.averageScore.toFixed(2)}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
    },
    chartContainer: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    chart: {
        borderRadius: theme_1.theme.borderRadius.md,
    },
    evaluationContainer: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    evaluationItem: {
        marginBottom: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    evaluationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    evaluationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    goodStatus: {
        backgroundColor: theme_1.theme.colors.success,
    },
    warningStatus: {
        backgroundColor: theme_1.theme.colors.warning,
    },
    badStatus: {
        backgroundColor: theme_1.theme.colors.error,
    },
    trendValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme_1.theme.colors.primary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    evaluationMessage: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    recommendationsContainer: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    recommendationItem: {
        marginBottom: theme_1.theme.spacing.sm,
    },
    recommendationText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
    scoreComparison: {
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.primary,
    },
    strengthIndicator: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        marginTop: theme_1.theme.spacing.xs,
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
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
        margin: theme_1.theme.spacing.md,
    },
    assessmentContent: {
        gap: theme_1.theme.spacing.sm,
    },
    assessmentText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        lineHeight: 20,
    },
});
exports.default = LoanTrendAnalysis;
