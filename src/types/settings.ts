export interface CalculatorConfig {
  defaultLoanType: string;
  defaultCity: string;
  defaultTerm: number;
  defaultRate: number;
  maxLoanAmount: number;
  maxTerm: number;
  roundingDecimals: number;
  maxInputLength: number;
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  showChart: boolean;
  showSchedule: boolean;
  compactMode: boolean;
  chartAnimations: boolean;
  autoSave: boolean;
}

export interface SyncConfig {
  syncEnabled: boolean;
  syncInterval: number;
  lastSyncTime?: number;
  syncItems: {
    history: boolean;
    settings: boolean;
    templates: boolean;
  };
}

export interface UserSettings {
  calculator: CalculatorConfig;
  ui: UIPreferences;
  sync: SyncConfig;
  lastModified: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  calculator: {
    defaultLoanType: 'commercialHouse',
    defaultCity: 'beijing',
    defaultTerm: 30,
    defaultRate: 4.65,
    maxLoanAmount: 10000000,
    maxTerm: 30,
    roundingDecimals: 2,
    maxInputLength: 10,
  },
  ui: {
    theme: 'system',
    language: 'zh',
    showChart: true,
    showSchedule: true,
    compactMode: false,
    chartAnimations: true,
    autoSave: true,
  },
  sync: {
    syncEnabled: false,
    syncInterval: 24 * 60 * 60 * 1000, // 24小时
    syncItems: {
      history: true,
      settings: true,
      templates: true,
    },
  },
  lastModified: Date.now(),
}; 