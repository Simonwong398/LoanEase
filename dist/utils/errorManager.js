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
exports.errorManager = void 0;
const errorHandler_1 = require("./errorHandler");
class ErrorManager {
    constructor() {
        this.errors = new Map();
    }
    static getInstance() {
        if (!ErrorManager.instance) {
            ErrorManager.instance = new ErrorManager();
        }
        return ErrorManager.instance;
    }
    handleCriticalError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            // 处理关键错误
            this.logError('critical', error);
            // 可以添加通知、重试或其他处理逻辑
        });
    }
    handleRecoverableError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            // 处理可恢复错误
            this.logError('recoverable', error);
            // 可以添加重试逻辑
        });
    }
    handleUnrecoverableError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            // 处理不可恢复错误
            this.logError('unrecoverable', error);
            // 可以添加用户通知或降级逻辑
        });
    }
    handleUnknownError(error, context) {
        return __awaiter(this, void 0, void 0, function* () {
            // 处理未知错误
            this.logError('unknown', error);
            // 可以添加通用错误处理逻辑
        });
    }
    logError(type, error) {
        if (!this.errors.has(type)) {
            this.errors.set(type, []);
        }
        this.errors.get(type).push(error);
    }
    getErrors(type) {
        if (type) {
            return this.errors.get(type) || [];
        }
        return Array.from(this.errors.values()).flat();
    }
    clearErrors() {
        this.errors.clear();
    }
    handleError(error, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (error instanceof errorHandler_1.LoanCalculationError) {
                if (error.context.severity === 'critical') {
                    yield this.handleCriticalError(error);
                }
                else if (error.recoverable) {
                    yield this.handleRecoverableError(error);
                }
                else {
                    yield this.handleUnrecoverableError(error);
                }
            }
            else {
                yield this.handleUnknownError(error, Object.assign({ timestamp: Date.now(), severity: errorHandler_1.ErrorSeverity.MEDIUM }, context));
            }
        });
    }
}
exports.errorManager = ErrorManager.getInstance();
