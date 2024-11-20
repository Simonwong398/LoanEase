import { useAsyncStorage } from './useAsyncStorage';

export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  defaultLoanType: string;
  defaultCity: string;
  defaultTerm: number;
  showChart: boolean;
  showSchedule: boolean;
  lastUsedValues: {
    amount?: string;
    rate?: string;
    term?: string;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'zh',
  theme: 'system',
  defaultLoanType: 'commercialHouse',
  defaultCity: 'beijing',
  defaultTerm: 30,
  showChart: true,
  showSchedule: false,
  lastUsedValues: {},
};

const SETTINGS_KEY = 'user_settings';

export function useUserSettings() {
  const [settings, setSettings, loading] = useAsyncStorage<UserSettings>(
    SETTINGS_KEY,
    DEFAULT_SETTINGS
  );

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await setSettings(updatedSettings);
  };

  const updateLastUsedValues = async (values: Partial<UserSettings['lastUsedValues']>) => {
    const updatedSettings = {
      ...settings,
      lastUsedValues: { ...settings.lastUsedValues, ...values },
    };
    await setSettings(updatedSettings);
  };

  const resetSettings = async () => {
    await setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    loading,
    updateSettings,
    updateLastUsedValues,
    resetSettings,
  };
} 