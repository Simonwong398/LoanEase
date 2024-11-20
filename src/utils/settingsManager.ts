import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';

class SettingsManager {
  private static instance: SettingsManager;
  private readonly STORAGE_KEY = '@user_settings';
  private settings: UserSettings = DEFAULT_SETTINGS;
  private listeners: Set<(settings: UserSettings) => void> = new Set();

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(data),
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      this.settings.lastModified = Date.now();
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  subscribe(listener: (settings: UserSettings) => void): () => void {
    this.listeners.add(listener);
    listener(this.settings);
    return () => this.listeners.delete(listener);
  }

  async updateCalculatorConfig(
    updates: Partial<UserSettings['calculator']>
  ): Promise<void> {
    this.settings.calculator = {
      ...this.settings.calculator,
      ...updates,
    };
    await this.saveSettings();
  }

  async updateUIPreferences(
    updates: Partial<UserSettings['ui']>
  ): Promise<void> {
    this.settings.ui = {
      ...this.settings.ui,
      ...updates,
    };
    await this.saveSettings();
  }

  async updateSyncConfig(
    updates: Partial<UserSettings['sync']>
  ): Promise<void> {
    this.settings.sync = {
      ...this.settings.sync,
      ...updates,
    };
    await this.saveSettings();
  }

  async resetSettings(): Promise<void> {
    this.settings = DEFAULT_SETTINGS;
    await this.saveSettings();
  }

  async exportSettings(): Promise<string> {
    return JSON.stringify(this.settings, null, 2);
  }

  async importSettings(settingsJson: string): Promise<void> {
    try {
      const newSettings = JSON.parse(settingsJson);
      // 验证设置格式
      if (this.validateSettings(newSettings)) {
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...newSettings,
        };
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  private validateSettings(settings: any): settings is UserSettings {
    // 实现设置验证逻辑
    return true;
  }

  getSettings(): UserSettings {
    return { ...this.settings };
  }
}

export const settingsManager = SettingsManager.getInstance(); 