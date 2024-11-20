import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';

import LoanCalculatorScreen from '../screens/LoanCalculatorScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { t } = useLanguage();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          headerStyle: {
            backgroundColor: theme.colors.surface,
            ...theme.shadows.small,
          },
          headerTintColor: theme.colors.text.primary,
        }}
      >
        <Tab.Screen
          name="Calculator"
          component={LoanCalculatorScreen}
          options={{
            title: t('navigation.calculator'),
            tabBarIcon: ({ color }) => (
              <Icon name="calculate" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: t('navigation.history'),
            tabBarIcon: ({ color }) => (
              <Icon name="history" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('navigation.settings'),
            tabBarIcon: ({ color }) => (
              <Icon name="settings" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 