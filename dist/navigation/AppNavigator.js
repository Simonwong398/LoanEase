"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const bottom_tabs_1 = require("@react-navigation/bottom-tabs");
const native_1 = require("@react-navigation/native");
const MaterialIcons_1 = __importDefault(require("react-native-vector-icons/MaterialIcons"));
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoanCalculatorScreen_1 = __importDefault(require("../screens/LoanCalculatorScreen"));
const HistoryScreen_1 = __importDefault(require("../screens/HistoryScreen"));
const SettingsScreen_1 = __importDefault(require("../screens/SettingsScreen"));
const Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
const AppNavigator = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    return (<native_1.NavigationContainer>
      <Tab.Navigator screenOptions={{
            tabBarActiveTintColor: theme_1.theme.colors.primary,
            tabBarInactiveTintColor: theme_1.theme.colors.text.secondary,
            headerStyle: Object.assign({ backgroundColor: theme_1.theme.colors.surface }, theme_1.theme.shadows.small),
            headerTintColor: theme_1.theme.colors.text.primary,
        }}>
        <Tab.Screen name="Calculator" component={LoanCalculatorScreen_1.default} options={{
            title: t('navigation.calculator'),
            tabBarIcon: ({ color }) => (<MaterialIcons_1.default name="calculate" size={24} color={color}/>),
        }}/>
        <Tab.Screen name="History" component={HistoryScreen_1.default} options={{
            title: t('navigation.history'),
            tabBarIcon: ({ color }) => (<MaterialIcons_1.default name="history" size={24} color={color}/>),
        }}/>
        <Tab.Screen name="Settings" component={SettingsScreen_1.default} options={{
            title: t('navigation.settings'),
            tabBarIcon: ({ color }) => (<MaterialIcons_1.default name="settings" size={24} color={color}/>),
        }}/>
      </Tab.Navigator>
    </native_1.NavigationContainer>);
};
exports.default = AppNavigator;
