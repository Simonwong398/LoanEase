"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportErrorCodes = exports.ExportError = void 0;
class ExportError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ExportError';
    }
}
exports.ExportError = ExportError;
exports.ExportErrorCodes = {
    FILE_CREATION_FAILED: 'FILE_CREATION_FAILED',
    SHARE_FAILED: 'SHARE_FAILED',
    INVALID_FORMAT: 'INVALID_FORMAT',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    UNKNOWN: 'UNKNOWN',
};
