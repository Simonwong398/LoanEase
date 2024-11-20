"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const cityPolicies_1 = require("../config/cityPolicies");
const PurchaseRestrictionAlert = ({ cityId, loanType, onUnderstand, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const cityPolicy = cityPolicies_1.cityPolicies[cityId];
    if (!(cityPolicy === null || cityPolicy === void 0 ? void 0 : cityPolicy.purchaseRestrictions)) {
        return null;
    }
    const isSecondHome = loanType === 'commercialSecondHouse';
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>
        {t('restrictions.title', { city: cityPolicy.name })}
      </react_native_1.Text>

      <react_native_1.View style={styles.content}>
        <react_native_1.Text style={styles.subtitle}>
          {isSecondHome ? t('restrictions.secondHome') : t('restrictions.firstHome')}
        </react_native_1.Text>
        
        {cityPolicy.purchaseRestrictions.map((restriction, index) => (<react_native_1.Text key={index} style={styles.restrictionItem}>
            • {restriction}
          </react_native_1.Text>))}

        <react_native_1.Text style={styles.warning}>
          {t('restrictions.warning')}
        </react_native_1.Text>
      </react_native_1.View>

      <react_native_1.TouchableOpacity style={styles.button} onPress={onUnderstand}>
        <react_native_1.Text style={styles.buttonText}>
          {t('restrictions.understand')}
        </react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    content: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.primary,
    },
    restrictionItem: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.sm,
        paddingLeft: theme_1.theme.spacing.sm,
    },
    warning: {
        fontSize: 14,
        color: theme_1.theme.colors.error,
        marginTop: theme_1.theme.spacing.md,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
    },
    buttonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = PurchaseRestrictionAlert;
