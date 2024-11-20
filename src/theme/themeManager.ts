import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme } from './defaultTheme';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  text: {
    primary: string;
    secondary: string;
    hint: string;
  };
  border: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBorderRadius {
  sm: number;
  md: number;
  lg: number;
  round: number;
}

export interface ThemeShadows {
  small: object;
  medium: object;
  large: object;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
}

class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = DefaultTheme;
  private subscribers = new Set<(theme: Theme) => void>();

  private constructor() {
    this.loadTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private async loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        this.currentTheme = { ...DefaultTheme, ...JSON.parse(savedTheme) };
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  private async saveTheme() {
    try {
      await AsyncStorage.setItem('@theme', JSON.stringify(this.currentTheme));
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  subscribe(callback: (theme: Theme) => void): () => void {
    this.subscribers.add(callback);
    callback(this.currentTheme);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentTheme));
  }

  async updateTheme(updates: Partial<Theme>) {
    this.currentTheme = {
      ...this.currentTheme,
      ...updates,
      colors: {
        ...this.currentTheme.colors,
        ...(updates.colors || {}),
      },
    };
    await this.saveTheme();
    this.notifySubscribers();
  }

  async setThemeColors(colors: Partial<ThemeColors>) {
    await this.updateTheme({
      colors: {
        ...this.currentTheme.colors,
        ...colors,
      },
    });
  }

  async setSpacing(spacing: Partial<ThemeSpacing>) {
    await this.updateTheme({
      spacing: {
        ...this.currentTheme.spacing,
        ...spacing,
      },
    });
  }

  async setBorderRadius(borderRadius: Partial<ThemeBorderRadius>) {
    await this.updateTheme({
      borderRadius: {
        ...this.currentTheme.borderRadius,
        ...borderRadius,
      },
    });
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  async resetTheme() {
    this.currentTheme = DefaultTheme;
    await this.saveTheme();
    this.notifySubscribers();
  }
}

export const themeManager = ThemeManager.getInstance(); 