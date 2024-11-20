import { jest } from '@jest/globals';
import { themeManager } from '../index';

describe('ThemeManager', () => {
  it('should initialize with light theme', () => {
    const theme = themeManager.getCurrentTheme();
    expect(theme.name).toBe('light');
    expect(theme.isDark).toBe(false);
  });

  it('should switch to dark theme', async () => {
    await themeManager.setTheme('dark');
    const theme = themeManager.getCurrentTheme();
    expect(theme.name).toBe('dark');
    expect(theme.isDark).toBe(true);
  });

  it('should handle custom themes', async () => {
    const customTheme = {
      name: 'custom',
      colors: themeManager.getCurrentTheme().colors,
      spacing: themeManager.getCurrentTheme().spacing,
      borderRadius: themeManager.getCurrentTheme().borderRadius,
      typography: themeManager.getCurrentTheme().typography,
      isDark: false,
    };

    await themeManager.addCustomTheme(customTheme);
    const themes = themeManager.getCustomThemes();
    expect(themes).toContainEqual(customTheme);
  });
}); 