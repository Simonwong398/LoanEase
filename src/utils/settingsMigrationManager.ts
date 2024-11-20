import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';

interface MigrationStep {
  version: number;
  migrate: (settings: any) => UserSettings;
}

class SettingsMigrationManager {
  private static instance: SettingsMigrationManager;
  private readonly CURRENT_VERSION = 2;
  private migrations: MigrationStep[] = [];

  private constructor() {
    this.initializeMigrations();
  }

  static getInstance(): SettingsMigrationManager {
    if (!SettingsMigrationManager.instance) {
      SettingsMigrationManager.instance = new SettingsMigrationManager();
    }
    return SettingsMigrationManager.instance;
  }

  private initializeMigrations() {
    // 版本1到2的迁移
    this.migrations.push({
      version: 2,
      migrate: (oldSettings: any) => {
        // 处理旧版本设置
        const settings: UserSettings = {
          ...DEFAULT_SETTINGS,
          calculator: {
            ...DEFAULT_SETTINGS.calculator,
            defaultLoanType: oldSettings.defaultLoanType || DEFAULT_SETTINGS.calculator.defaultLoanType,
            defaultCity: oldSettings.defaultCity || DEFAULT_SETTINGS.calculator.defaultCity,
          },
          ui: {
            ...DEFAULT_SETTINGS.ui,
            theme: oldSettings.theme || DEFAULT_SETTINGS.ui.theme,
            language: oldSettings.language || DEFAULT_SETTINGS.ui.language,
          },
          sync: DEFAULT_SETTINGS.sync,
          lastModified: Date.now(),
        };
        return settings;
      },
    });
  }

  migrateSettings(settings: any, fromVersion: number): UserSettings {
    let currentSettings = settings;
    
    // 按版本顺序执行迁移
    this.migrations
      .filter(step => step.version > fromVersion)
      .sort((a, b) => a.version - b.version)
      .forEach(step => {
        try {
          currentSettings = step.migrate(currentSettings);
        } catch (error) {
          console.error(`Migration to version ${step.version} failed:`, error);
          // 如果迁移失败，使用默认设置
          currentSettings = { ...DEFAULT_SETTINGS };
        }
      });

    return currentSettings;
  }

  getCurrentVersion(): number {
    return this.CURRENT_VERSION;
  }

  needsMigration(version: number): boolean {
    return version < this.CURRENT_VERSION;
  }
}

export const settingsMigrationManager = SettingsMigrationManager.getInstance(); 