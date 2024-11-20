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
exports.handleError = handleError;
exports.withErrorHandling = withErrorHandling;
const errors_1 = require("../types/errors");
const auditManager_1 = require("./auditManager");
function handleError(error_1) {
    return __awaiter(this, arguments, void 0, function* (error, options = {}) {
        const { rethrow = true, context = 'unknown', operation = 'unknown' } = options;
        // 标准化错误对象
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        // 记录错误
        yield auditManager_1.auditManager.logEvent({
            type: 'error',
            action: operation,
            status: 'failure',
            details: {
                context,
                errorType: normalizedError.name,
                errorMessage: normalizedError.message,
                errorCode: error instanceof errors_1.AppError ? error.code : 'UNKNOWN_ERROR',
                errorDetails: error instanceof errors_1.AppError ? error.details : undefined,
                stack: normalizedError.stack,
            },
        });
        // 如果需要，重新抛出错误
        if (rethrow) {
            throw normalizedError;
        }
    });
}
function withErrorHandling(operation_1) {
    return __awaiter(this, arguments, void 0, function* (operation, options = {}) {
        try {
            return yield operation();
        }
        catch (error) {
            yield handleError(error, options);
            throw error; // TypeScript 需要这行，虽然 handleError 已经可能抛出错误
        }
    });
}
