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
exports.calculateWithRetry = exports.withRetry = exports.RetryError = void 0;
const DEFAULT_CONFIG = {
    maxAttempts: 3,
    delayMs: 1000,
    backoffFactor: 2,
};
class RetryError extends Error {
    constructor(message, attempts, lastError) {
        super(message);
        this.name = 'RetryError';
        this.attempts = attempts;
        this.lastError = lastError;
    }
}
exports.RetryError = RetryError;
const withRetry = (operation_1, ...args_1) => __awaiter(void 0, [operation_1, ...args_1], void 0, function* (operation, config = {}) {
    const finalConfig = Object.assign(Object.assign({}, DEFAULT_CONFIG), config);
    let lastError;
    let delay = finalConfig.delayMs;
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        try {
            return yield operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === finalConfig.maxAttempts) {
                throw new RetryError(`Operation failed after ${attempt} attempts`, attempt, lastError);
            }
            yield new Promise(resolve => setTimeout(resolve, delay));
            delay *= finalConfig.backoffFactor;
        }
    }
    throw new RetryError('Unexpected retry failure', finalConfig.maxAttempts, lastError);
});
exports.withRetry = withRetry;
// 使用示例：
const calculateWithRetry = (calculation, onRetry) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, exports.withRetry)(calculation, {
            maxAttempts: 3,
            delayMs: 1000,
            backoffFactor: 2,
        });
    }
    catch (error) {
        if (error instanceof RetryError) {
            console.error(`Calculation failed after ${error.attempts} attempts:`, error.lastError);
        }
        throw error;
    }
});
exports.calculateWithRetry = calculateWithRetry;
