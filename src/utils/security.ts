import { AppError } from '../types/errors';

export class SecurityError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}

/**
 * 数据验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * 清理字符串数据，防止XSS攻击
 */
export function sanitizeData(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/[<>]/g, '') // 移除 HTML 标签
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * 生成安全的哈希值
 */
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证数值范围
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): number {
  if (!Number.isFinite(value)) {
    throw new ValidationError('Invalid number value');
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  maxLength: number
): string {
  if (typeof value !== 'string') {
    throw new ValidationError('Value must be a string');
  }
  return value.slice(0, maxLength);
}

/**
 * 验证数组长度
 */
export function validateArrayLength<T>(
  array: T[],
  maxLength: number
): T[] {
  if (!Array.isArray(array)) {
    throw new ValidationError('Value must be an array');
  }
  return array.slice(0, maxLength);
} 