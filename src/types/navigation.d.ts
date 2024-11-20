declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
}

declare module '@react-navigation/native' {
  export function NavigationContainer({ children }: { children: React.ReactNode }): JSX.Element;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  export default class Icon extends Component<any> {}
}

declare module 'react-native-safe-area-context' {
  export function SafeAreaProvider({ children }: { children: React.ReactNode }): JSX.Element;
} 