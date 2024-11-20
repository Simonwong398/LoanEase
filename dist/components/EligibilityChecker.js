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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const cityPolicies_1 = require("../config/cityPolicies");
const EligibilityChecker = ({ cityId, onEligibilityChange, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const cityPolicy = cityPolicies_1.cityPolicies[cityId];
    const [answers, setAnswers] = (0, react_1.useState)({});
    const questions = [
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
    const handleAnswerChange = (questionId, value) => {
        const newAnswers = Object.assign(Object.assign({}, answers), { [questionId]: value });
        setAnswers(newAnswers);
        // 检查资格
        const isEligible = questions.every(q => !q.required || newAnswers[q.id] === true);
        onEligibilityChange(isEligible);
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('eligibility.title')}</react_native_1.Text>
      <react_native_1.Text style={styles.subtitle}>
        {t('eligibility.cityRequirement', { city: cityPolicy.name })}
      </react_native_1.Text>

      {questions.map(q => (<react_native_1.View key={q.id} style={styles.questionContainer}>
          <react_native_1.Text style={styles.question}>
            {q.question}
            {q.required && <react_native_1.Text style={styles.required}> *</react_native_1.Text>}
          </react_native_1.Text>
          <react_native_1.Switch value={answers[q.id] || false} onValueChange={(value) => handleAnswerChange(q.id, value)} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
        </react_native_1.View>))}

      <react_native_1.Text style={styles.note}>
        {t('eligibility.note')}
      </react_native_1.Text>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.text.primary,
    },
    subtitle: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.md,
    },
    questionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme_1.theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    question: {
        flex: 1,
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        marginRight: theme_1.theme.spacing.md,
    },
    required: {
        color: theme_1.theme.colors.error,
    },
    note: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        marginTop: theme_1.theme.spacing.md,
        fontStyle: 'italic',
    },
});
exports.default = EligibilityChecker;
