/**
 * 格式化工具函数
 */

/**
 * 格式化货币金额
 * @param amount 金额数值
 * @param currency 货币符号，默认为 ¥
 * @param decimals 小数位数，默认为 2
 */
export const formatCurrency = (
  amount: number,
  currency: string = '¥',
  decimals: number = 2
): string => {
  if (!amount && amount !== 0) return `${currency}0.00`;
  return `${currency}${Math.abs(amount).toFixed(decimals)}`;
};

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数，默认为 2
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  if (!value && value !== 0) return '0.00%';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化数字（添加千位分隔符）
 * @param value 数值
 * @param decimals 小数位数，默认为 2
 * @param separator 分隔符，默认为 ,
 */
export const formatNumber = (
  value: number,
  decimals: number = 2,
  separator: string = ','
): string => {
  if (!value && value !== 0) return '0';
  const parts = Math.abs(value).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return value < 0 ? `-${parts.join('.')}` : parts.join('.');
};

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认为 YYYY-MM-DD
 */
export const formatDate = (
  date: Date | number | string,
  format: string = 'YYYY-MM-DD'
): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : 
              typeof date === 'number' ? new Date(date) : date;
    
    return format
      .replace('YYYY', d.getFullYear().toString())
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'));
  } catch {
    return '';
  }
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为 2
 */
export function formatFileSize(
  bytes: number,
  decimals: number = 2
): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

/**
 * 格式化时长
 * @param milliseconds 毫秒数
 * @param showSeconds 是否显示秒数，默认为 true
 */
export function formatDuration(
  milliseconds: number,
  showSeconds: boolean = true
): string {
  if (!milliseconds && milliseconds !== 0) return '';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天`;
  if (hours > 0) return `${hours}小时`;
  if (minutes > 0) return `${minutes}分钟`;
  if (showSeconds) return `${seconds}秒`;
  return '< 1分钟';
} 