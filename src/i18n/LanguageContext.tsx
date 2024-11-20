import React, { createContext, useState, useContext } from 'react';
import { translations } from './translations';

type TranslationParams = Record<string, string | number>;

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string, params?: TranslationParams): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value[k];
    }

    if (typeof value === 'string' && params) {
      return Object.entries(params).reduce((str, [key, val]) => {
        return str.replace(`{${key}}`, val.toString());
      }, value);
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 