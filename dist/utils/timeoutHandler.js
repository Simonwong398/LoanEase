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
exports.withTimeout = withTimeout;
exports.createTimeoutSignal = createTimeoutSignal;
exports.withTimeoutSignal = withTimeoutSignal;
const errors_1 = require("../types/errors");
function withTimeout(operation_1, timeoutMs_1) {
    return __awaiter(this, arguments, void 0, function* (operation, timeoutMs, operationName = 'Operation') {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new errors_1.TimeoutError(`${operationName} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            operation()
                .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    });
}
function createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
}
function withTimeoutSignal(operation_1, timeoutMs_1) {
    return __awaiter(this, arguments, void 0, function* (operation, timeoutMs, operationName = 'Operation') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return yield operation(controller.signal);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new errors_1.TimeoutError(`${operationName} timed out after ${timeoutMs}ms`);
            }
            throw error;
        }
        finally {
            clearTimeout(timeoutId);
        }
    });
}
