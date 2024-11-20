"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFileName = exports.generateFileName = void 0;
const generateFileName = (format, prefix = '贷款计算结果', timestamp = true) => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = timestamp ?
        `_${date.getHours()}${date.getMinutes()}${date.getSeconds()}` :
        '';
    return `${prefix}_${dateStr}${timeStr}.${format.toLowerCase()}`;
};
exports.generateFileName = generateFileName;
const sanitizeFileName = (fileName) => {
    // 移除不合法的文件名字符
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
};
exports.sanitizeFileName = sanitizeFileName;
