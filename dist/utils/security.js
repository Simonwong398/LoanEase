"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.SecurityError = void 0;
exports.sanitizeData = sanitizeData;
exports.generateHash = generateHash;
exports.validateNumberRange = validateNumberRange;
exports.validateStringLength = validateStringLength;
exports.validateArrayLength = validateArrayLength;
const errors_1 = require("../types/errors");
class SecurityError extends errors_1.AppError {
    constructor(message, details) {
        super(message, 'SECURITY_ERROR', details);
        this.name = 'SecurityError';
    }
}
exports.SecurityError = SecurityError;
/**
 * 数据验证错误
 */
class ValidationError extends errors_1.AppError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * 清理字符串数据，防止XSS攻击
 */
function sanitizeData(input) {
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
function generateHash(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = yield crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
}
/**
 * 验证数值范围
 */
function validateNumberRange(value, min, max) {
    if (!Number.isFinite(value)) {
        throw new ValidationError('Invalid number value');
    }
    return Math.min(Math.max(value, min), max);
}
/**
 * 验证字符串长度
 */
function validateStringLength(value, maxLength) {
    if (typeof value !== 'string') {
        throw new ValidationError('Value must be a string');
    }
    return value.slice(0, maxLength);
}
/**
 * 验证数组长度
 */
function validateArrayLength(array, maxLength) {
    if (!Array.isArray(array)) {
        throw new ValidationError('Value must be an array');
    }
    return array.slice(0, maxLength);
}
