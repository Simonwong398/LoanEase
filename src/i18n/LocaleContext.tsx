import React, { createContext, useContext, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import { Locale, LocaleConfig } from './types';
import { localeConfigs } from './formatters';

interface LocaleContextType {
  locale: Locale;
  isRTL: boolean;
  config: LocaleConfig;
  setLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'zh-CN',
  isRTL: false,
  config: localeConfigs['zh-CN'],
  setLocale: async () => {},
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');
  const config = localeConfigs[locale];

  const setLocale = useCallback(async (newLocale: Locale) => {
    const newConfig = localeConfigs[newLocale];
    
    // 处理 RTL 切换
    if (I18nManager.isRTL !== newConfig.isRTL) {
      await I18nManager.forceRTL(newConfig.isRTL);
      // 需要重启应用以应用 RTL 更改
    }

    setLocaleState(newLocale);
  }, []);

  return (
    <LocaleContext.Provider
      value={{
        locale,
        isRTL: config.isRTL,
        config,
        setLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext); 