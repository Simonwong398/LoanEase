import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { cityPolicies, CityPolicy } from '../config/cityPolicies';

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onCityChange,
}) => {
  const { t } = useLanguage();
  const selectedPolicy = cityPolicies[selectedCity];

  const cityItems = Object.values(cityPolicies).map(city => ({
    label: city.name,
    value: city.id,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={onCityChange}
          items={cityItems}
          value={selectedCity}
          style={pickerSelectStyles}
          placeholder={{ label: t('citySelector.placeholder'), value: null }}
        />
      </View>

      {selectedPolicy && (
        <View style={styles.policyContainer}>
          <Text style={styles.title}>{selectedPolicy.name}购房政策</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>首套房</Text>
            <Text style={styles.policyText}>
              最低首付比例: {selectedPolicy.restrictions.firstHome.downPayment}%
            </Text>
            <Text style={styles.policyText}>
              利率: LPR{selectedPolicy.restrictions.firstHome.lprOffset > 0 ? 
                `+${selectedPolicy.restrictions.firstHome.lprOffset}` : 
                selectedPolicy.restrictions.firstHome.lprOffset}基点
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>二套房</Text>
            <Text style={styles.policyText}>
              最低首付比例: {selectedPolicy.restrictions.secondHome.downPayment}%
            </Text>
            <Text style={styles.policyText}>
              利率: LPR+{selectedPolicy.restrictions.secondHome.lprOffset}基点
            </Text>
          </View>

          {selectedPolicy.purchaseRestrictions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>限购政策</Text>
              {selectedPolicy.purchaseRestrictions.map((restriction, index) => (
                <Text key={index} style={styles.restrictionText}>
                  • {restriction}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  pickerContainer: {
    padding: theme.spacing.md,
  },
  policyContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
  },
  policyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  restrictionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
  },
});

export default CitySelector; 