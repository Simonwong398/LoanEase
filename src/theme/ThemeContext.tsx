import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, themeManager } from './themeManager';
import { DefaultTheme } from './defaultTheme';

const ThemeContext = createContext<Theme>(DefaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(DefaultTheme);

  useEffect(() => {
    return themeManager.subscribe(setTheme);
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 