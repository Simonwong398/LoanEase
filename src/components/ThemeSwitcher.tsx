import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { themeManager, ThemeColors } from '../theme/themeManager';

interface ColorScheme {
  name: string;
  colors: Partial<ThemeColors>;
}

const colorSchemes: ColorScheme[] = [
  {
    name: 'Default',
    colors: {
      primary: '#1976D2',
      secondary: '#424242',
    },
  },
  {
    name: 'Dark',
    colors: {
      primary: '#90CAF9',
      secondary: '#B0BEC5',
      background: '#121212',
      surface: '#1E1E1E',
      text: {
        primary: '#FFFFFF',
        secondary: '#B0BEC5',
        hint: '#78909C',
      },
    },
  },
  {
    name: 'Nature',
    colors: {
      primary: '#4CAF50',
      secondary: '#81C784',
    },
  },
];

const ThemeSwitcher: React.FC = () => {
  const theme = useTheme();

  const handleSchemePress = async (scheme: ColorScheme) => {
    await themeManager.setThemeColors(scheme.colors);
  };

  return (
    <View style={styles.container}>
      {colorSchemes.map((scheme) => (
        <TouchableOpacity
          key={scheme.name}
          style={[
            styles.schemeButton,
            { backgroundColor: scheme.colors.primary },
          ]}
          onPress={() => handleSchemePress(scheme)}
        >
          <Text style={styles.schemeName}>{scheme.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  schemeButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  schemeName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ThemeSwitcher; 