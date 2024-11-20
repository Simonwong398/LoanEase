"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_picker_select_1 = __importDefault(require("react-native-picker-select"));
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const cityPolicies_1 = require("../config/cityPolicies");
const CitySelector = ({ selectedCity, onCityChange, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const selectedPolicy = cityPolicies_1.cityPolicies[selectedCity];
    const cityItems = Object.values(cityPolicies_1.cityPolicies).map(city => ({
        label: city.name,
        value: city.id,
    }));
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.pickerContainer}>
        <react_native_picker_select_1.default onValueChange={onCityChange} items={cityItems} value={selectedCity} style={pickerSelectStyles} placeholder={{ label: t('citySelector.placeholder'), value: null }}/>
      </react_native_1.View>

      {selectedPolicy && (<react_native_1.View style={styles.policyContainer}>
          <react_native_1.Text style={styles.title}>{selectedPolicy.name}购房政策</react_native_1.Text>
          
          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>首套房</react_native_1.Text>
            <react_native_1.Text style={styles.policyText}>
              最低首付比例: {selectedPolicy.restrictions.firstHome.downPayment}%
            </react_native_1.Text>
            <react_native_1.Text style={styles.policyText}>
              利率: LPR{selectedPolicy.restrictions.firstHome.lprOffset > 0 ?
                `+${selectedPolicy.restrictions.firstHome.lprOffset}` :
                selectedPolicy.restrictions.firstHome.lprOffset}基点
            </react_native_1.Text>
          </react_native_1.View>

          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>二套房</react_native_1.Text>
            <react_native_1.Text style={styles.policyText}>
              最低首付比例: {selectedPolicy.restrictions.secondHome.downPayment}%
            </react_native_1.Text>
            <react_native_1.Text style={styles.policyText}>
              利率: LPR+{selectedPolicy.restrictions.secondHome.lprOffset}基点
            </react_native_1.Text>
          </react_native_1.View>

          {selectedPolicy.purchaseRestrictions && (<react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>限购政策</react_native_1.Text>
              {selectedPolicy.purchaseRestrictions.map((restriction, index) => (<react_native_1.Text key={index} style={styles.restrictionText}>
                  • {restriction}
                </react_native_1.Text>))}
            </react_native_1.View>)}
        </react_native_1.View>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    pickerContainer: {
        padding: theme_1.theme.spacing.md,
    },
    policyContainer: {
        padding: theme_1.theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme_1.theme.colors.border,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    section: {
        marginBottom: theme_1.theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.primary,
    },
    policyText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    restrictionText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
        marginLeft: theme_1.theme.spacing.sm,
    },
});
const pickerSelectStyles = react_native_1.StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: theme_1.theme.spacing.md,
        paddingHorizontal: theme_1.theme.spacing.md,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: theme_1.theme.spacing.sm,
        paddingHorizontal: theme_1.theme.spacing.md,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = CitySelector;
