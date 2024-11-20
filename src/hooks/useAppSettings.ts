import { useState, useEffect } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';
import { settingsManager } from '../utils/settingsManager';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    settings,
    loading,
  };
}; 