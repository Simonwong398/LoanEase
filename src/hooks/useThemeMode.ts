import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const useThemeMode = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme) {
      setThemeMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  return [themeMode, setThemeMode] as const;
}; 