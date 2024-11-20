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
exports.errorManager = exports.AppError = exports.ErrorSeverity = exports.ErrorType = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
// 错误类型定义
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION"] = "validation";
    ErrorType["NETWORK"] = "network";
    ErrorType["STORAGE"] = "storage";
    ErrorType["SECURITY"] = "security";
    ErrorType["BUSINESS"] = "business";
    ErrorType["SYSTEM"] = "system";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// 错误严重程度
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// 自定义错误类
class AppError extends Error {
    constructor(details) {
        var _a, _b, _c, _d, _e;
        super(details.message);
        this.name = 'AppError';
        this.timestamp = Date.now();
        this._handled = false;
        this.details = Object.assign(Object.assign({}, details), { recoveryAttempts: 0, context: {
                timestamp: Date.now(),
                component: ((_a = details.context) === null || _a === void 0 ? void 0 : _a.component) || 'unknown',
                operation: ((_b = details.context) === null || _b === void 0 ? void 0 : _b.operation) || 'unknown',
                input: (_c = details.context) === null || _c === void 0 ? void 0 : _c.input,
                state: (_d = details.context) === null || _d === void 0 ? void 0 : _d.state,
                stack: this.stack,
                cause: (_e = details.context) === null || _e === void 0 ? void 0 : _e.cause
            } });
    }
    get handled() {
        return this._handled;
    }
    set handled(value) {
        this._handled = value;
    }
}
exports.AppError = AppError;
class ErrorManager {
    constructor() {
        this.errors = new Map();
        this.stats = new Map();
        this.recoveryStrategies = new Map();
        this.errorPatterns = new Map();
        this.globalErrorHandler = null;
        this.initializeErrorBoundary();
        this.registerDefaultRecoveryStrategies();
    }
    static getInstance() {
        if (!ErrorManager.instance) {
            ErrorManager.instance = new ErrorManager();
        }
        return ErrorManager.instance;
    }
    // 注册错误恢复策略
    registerRecoveryStrategy(errorCode, strategy) {
        this.recoveryStrategies.set(errorCode, strategy);
    }
    // 注册错误模式
    registerErrorPattern(name, pattern) {
        this.errorPatterns.set(name, pattern);
    }
    // 设置全局错误处理器
    setGlobalErrorHandler(handler) {
        this.globalErrorHandler = handler;
    }
    // 处理错误
    handleError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const appError = this.normalizeError(error);
                // 记录错误
                this.recordError(appError);
                // 更新统计信息
                this.updateErrorStats(appError);
                // 尝试恢复
                if (appError.details.recoverable) {
                    yield this.attemptRecovery(appError);
                }
                // 通知全局处理器
                if (this.globalErrorHandler) {
                    this.globalErrorHandler(appError);
                }
                // 记录性能指标
                yield performance_1.performanceManager.recordMetric('errorHandling', 'handle', performance.now() - startTime, {
                    type: appError.details.type,
                    severity: appError.details.severity,
                    recovered: appError.handled,
                    errorCode: appError.details.code,
                    recoveryAttempts: appError.details.recoveryAttempts
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('ErrorManager', 'Error handling failed', actualError);
            }
        });
    }
    // 获取错误分析报告
    getErrorAnalysis() {
        return __awaiter(this, void 0, void 0, function* () {
            const analysis = {
                totalErrors: this.errors.size,
                errorsByType: {},
                errorsBySeverity: {},
                topErrors: [],
                recoveryRate: 0,
                averageRecoveryTime: 0,
                errorPatterns: []
            };
            // 统计错误类型和严重程度
            for (const error of this.errors.values()) {
                analysis.errorsByType[error.type] = (analysis.errorsByType[error.type] || 0) + 1;
                analysis.errorsBySeverity[error.severity] = (analysis.errorsBySeverity[error.severity] || 0) + 1;
            }
            // 计算恢复率和平均恢复时间
            let totalRecoveries = 0;
            let totalRecoveryTime = 0;
            for (const stat of this.stats.values()) {
                totalRecoveries += stat.successfulRecoveries;
                totalRecoveryTime += stat.avgRecoveryTime * stat.successfulRecoveries;
            }
            analysis.recoveryRate = totalRecoveries / this.errors.size;
            analysis.averageRecoveryTime = totalRecoveryTime / totalRecoveries;
            // 获取错误模式匹配
            for (const [name, pattern] of this.errorPatterns) {
                let matches = 0;
                for (const error of this.errors.values()) {
                    if (pattern.test(error.message)) {
                        matches++;
                    }
                }
                analysis.errorPatterns.push({ pattern: name, matches });
            }
            return analysis;
        });
    }
    normalizeError(error) {
        if (error instanceof AppError) {
            return error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        return new AppError({
            type: ErrorType.SYSTEM,
            code: 'UNKNOWN_ERROR',
            message: errorMessage,
            severity: ErrorSeverity.HIGH,
            recoverable: false,
            retryable: false,
            suggestions: ['Contact system administrator'],
            recoveryAttempts: 0,
            context: {
                stack: errorStack,
                cause: error instanceof Error ? error : undefined
            }
        });
    }
    recordError(error) {
        const errorId = `${error.details.type}_${error.details.code}_${error.timestamp}`;
        this.errors.set(errorId, error.details);
        const errorLog = new Error(error.message);
        Object.assign(errorLog, {
            stack: error.stack,
            details: error.details
        });
        logger_1.logger.error('ErrorManager', error.message, errorLog);
    }
    updateErrorStats(error) {
        const key = `${error.details.type}_${error.details.code}`;
        const existingStats = this.stats.get(key) || {
            count: 0,
            firstOccurrence: error.timestamp,
            lastOccurrence: error.timestamp,
            frequency: 0,
            avgRecoveryTime: 0,
            successfulRecoveries: 0,
            failedRecoveries: 0
        };
        existingStats.count++;
        existingStats.lastOccurrence = error.timestamp;
        existingStats.frequency = existingStats.count /
            ((error.timestamp - existingStats.firstOccurrence) / (24 * 60 * 60 * 1000));
        this.stats.set(key, existingStats);
    }
    attemptRecovery(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const strategy = this.recoveryStrategies.get(error.details.code);
            if (!strategy)
                return;
            const startTime = performance.now();
            const key = `${error.details.type}_${error.details.code}`;
            const stats = this.stats.get(key);
            try {
                yield strategy(error);
                error.handled = true;
                if (stats) {
                    stats.successfulRecoveries++;
                    stats.avgRecoveryTime = (stats.avgRecoveryTime * (stats.successfulRecoveries - 1) +
                        (performance.now() - startTime)) / stats.successfulRecoveries;
                }
            }
            catch (recoveryError) {
                if (stats) {
                    stats.failedRecoveries++;
                }
                throw recoveryError;
            }
        });
    }
    initializeErrorBoundary() {
        // 处理未捕获的异步错误
        process.on('unhandledRejection', (reason) => {
            this.handleError(reason).catch(error => {
                logger_1.logger.error('ErrorManager', 'Failed to handle unhandledRejection', error);
            });
        });
        // 处理未捕获的同步错误
        process.on('uncaughtException', (error) => {
            this.handleError(error).catch(handlingError => {
                logger_1.logger.error('ErrorManager', 'Failed to handle uncaughtException', handlingError);
            });
        });
    }
    registerDefaultRecoveryStrategies() {
        // 注册默认的恢复策略
        this.registerRecoveryStrategy('NETWORK_ERROR', (error) => __awaiter(this, void 0, void 0, function* () {
            // 实现网络错误恢复策略
        }));
        this.registerRecoveryStrategy('STORAGE_ERROR', (error) => __awaiter(this, void 0, void 0, function* () {
            // 实现存储错误恢复策略
        }));
        // ... 注册其他默认恢复策略
    }
}
ErrorManager.instance = null;
exports.errorManager = ErrorManager.getInstance();
