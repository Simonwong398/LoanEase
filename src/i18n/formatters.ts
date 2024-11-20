import { LocaleConfig, LocaleFormats, Locale } from './types';

export const localeConfigs: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    locale: 'zh-CN',
    isRTL: false,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    currencySymbol: '¥',
    currencyPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  'en-US': {
    locale: 'en-US',
    isRTL: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm:ss A',
    currencySymbol: '$',
    currencyPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  'ar-SA': {
    locale: 'ar-SA',
    isRTL: true,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    currencySymbol: 'ر.س',
    currencyPosition: 'after',
    thousandsSeparator: '،',
    decimalSeparator: '٫',
  },
};

const localeFormats: Record<Locale, LocaleFormats> = {
  'zh-CN': {
    date: {
      short: 'yyyy-MM-dd',
      medium: 'yyyy年M月d日',
      long: 'yyyy年M月d日 EEEE',
      full: 'yyyy年M月d日 EEEE HH:mm:ss',
    },
    time: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss.SSS',
    },
    number: {
      decimal: 2,
      currency: 2,
      percent: 2,
    },
  },
  'en-US': {
    date: {
      short: 'MM/dd/yyyy',
      medium: 'MMM d, yyyy',
      long: 'MMMM d, yyyy',
      full: 'EEEE, MMMM d, yyyy',
    },
    time: {
      short: 'h:mm a',
      medium: 'h:mm:ss a',
      long: 'h:mm:ss.SSS a',
    },
    number: {
      decimal: 2,
      currency: 2,
      percent: 1,
    },
  },
  'ar-SA': {
    date: {
      short: 'dd/MM/yyyy',
      medium: 'd MMM yyyy',
      long: 'd MMMM yyyy',
      full: 'EEEE، d MMMM yyyy',
    },
    time: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss.SSS',
    },
    number: {
      decimal: 3,
      currency: 2,
      percent: 2,
    },
  },
};

export const formatters = {
  /**
   * 格式化日期
   * @param date 日期对象或时间戳
   * @param formatType 格式类型
   * @param locale 区域设置
   * @returns 格式化后的日期字符串
   */
  formatDate: (
    date: Date | number,
    formatType: keyof LocaleFormats['date'] = 'medium',
    locale: Locale = 'zh-CN'
  ): string => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: formatType === 'short' ? '2-digit' : 'long',
      day: '2-digit',
      weekday: formatType === 'full' ? 'long' : undefined,
    };
    
    return d.toLocaleDateString(locale, options);
  },

  /**
   * 格式化时间
   * @param date 日期对象或时间戳
   * @param formatType 格式类型
   * @param locale 区域设置
   * @returns 格式化后的时间字符串
   */
  formatTime: (
    date: Date | number,
    formatType: keyof LocaleFormats['time'] = 'medium',
    locale: Locale = 'zh-CN'
  ): string => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: formatType !== 'short' ? '2-digit' : undefined,
      hour12: locale === 'en-US',
    };
    
    let time = d.toLocaleTimeString(locale, options);
    if (formatType === 'long') {
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      time = `${time}.${ms}`;
    }
    
    return time;
  },

  /**
   * 格式化数字
   * @param value 数值
   * @param type 格式类型
   * @param locale 区域设置
   * @returns 格式化后的数字字符串
   */
  formatNumber: (
    value: number,
    type: keyof LocaleFormats['number'] = 'decimal',
    locale: Locale = 'zh-CN'
  ): string => {
    const config = localeConfigs[locale];
    const decimals = localeFormats[locale].number[type];

    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return formatter.format(value);
  },

  /**
   * 格式化货币
   * @param value 金额
   * @param locale 区域设置
   * @returns 格式化后的货币字符串
   */
  formatCurrency: (
    value: number,
    locale: Locale = 'zh-CN'
  ): string => {
    const config = localeConfigs[locale];
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: locale === 'zh-CN' ? 'CNY' : locale === 'en-US' ? 'USD' : 'SAR',
    });

    return formatter.format(value);
  },

  /**
   * 格式化百分比
   * @param value 数值
   * @param locale 区域设置
   * @returns 格式化后的百分比字符串
   */
  formatPercent: (
    value: number,
    locale: Locale = 'zh-CN'
  ): string => {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: localeFormats[locale].number.percent,
      maximumFractionDigits: localeFormats[locale].number.percent,
    });

    return formatter.format(value);
  },
}; 