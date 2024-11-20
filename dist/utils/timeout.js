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
exports.TimeoutError = void 0;
exports.withTimeout = withTimeout;
exports.createTimeoutSignal = createTimeoutSignal;
exports.withTimeoutSignal = withTimeoutSignal;
class TimeoutError extends Error {
    constructor(message = 'Operation timed out') {
        super(message);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
/**
 * 为 Promise 添加超时控制
 */
function withTimeout(promise_1, timeoutMs_1) {
    return __awaiter(this, arguments, void 0, function* (promise, timeoutMs, operationName = 'Operation') {
        const timeoutPromise = new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId);
                reject(new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
    });
}
/**
 * 创建带超时的 AbortSignal
 */
function createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
}
/**
 * 使用 AbortSignal 的超时处理
 */
function withTimeoutSignal(operation_1, timeoutMs_1) {
    return __awaiter(this, arguments, void 0, function* (operation, timeoutMs, operationName = 'Operation') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return yield operation(controller.signal);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`);
            }
            throw error;
        }
        finally {
            clearTimeout(timeoutId);
        }
    });
}
