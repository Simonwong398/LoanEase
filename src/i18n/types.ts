export type Locale = 'zh-CN' | 'en-US' | 'ar-SA';

export interface LocaleConfig {
  locale: Locale;
  isRTL: boolean;
  dateFormat: string;
  timeFormat: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface LocaleFormats {
  date: {
    short: string;
    medium: string;
    long: string;
    full: string;
  };
  time: {
    short: string;
    medium: string;
    long: string;
  };
  number: {
    decimal: number;
    currency: number;
    percent: number;
  };
} 