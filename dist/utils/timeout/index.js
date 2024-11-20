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
exports.TimeoutError = exports.timeoutManager = void 0;
// 超时错误类
class TimeoutError extends Error {
    constructor(message, duration, operationId) {
        super(message);
        this.duration = duration;
        this.operationId = operationId;
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class TimeoutManager {
    constructor() {
        this.timeouts = new Map();
        this.states = new Map();
        // 默认超时配置
        this.defaultTimeouts = {
            network: 5000, // 网络请求超时 5s
            database: 3000, // 数据库操作超时 3s
            cache: 1000, // 缓存操作超时 1s
            computation: 2000 // 计算操作超时 2s
        };
    }
    static getInstance() {
        if (!TimeoutManager.instance) {
            TimeoutManager.instance = new TimeoutManager();
        }
        return TimeoutManager.instance;
    }
    // 包装异步操作添加超时处理
    withTimeout(operation, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const timeoutConfig = typeof config === 'number' ? { timeout: config } : config;
            this.states.set(operationId, {
                startTime: Date.now(),
                attempts: 0
            });
            return this.executeWithRetries(operation, operationId, timeoutConfig);
        });
    }
    // 带重试的执行
    executeWithRetries(operation, operationId, config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const state = this.states.get(operationId);
            const maxAttempts = (config.retries || 0) + 1;
            while (state.attempts < maxAttempts) {
                try {
                    return yield this.executeWithTimeout(operation, operationId, config);
                }
                catch (error) {
                    state.attempts++;
                    state.lastError = error instanceof Error ? error : new Error(String(error));
                    if (error instanceof TimeoutError) {
                        // 触发超时回调
                        (_a = config.onTimeout) === null || _a === void 0 ? void 0 : _a.call(config);
                        // 如果有 fallback，且是最后一次尝试，则执行 fallback
                        if (config.fallback && state.attempts === maxAttempts) {
                            return config.fallback();
                        }
                    }
                    // 如果还有重试机会，则等待后重试
                    if (state.attempts < maxAttempts) {
                        const delay = this.calculateRetryDelay(config.retryDelay, state.attempts);
                        yield this.delay(delay);
                        continue;
                    }
                    // 清理状态
                    this.cleanup(operationId);
                    throw state.lastError;
                }
            }
            throw state.lastError;
        });
    }
    // 执行带超时的操作
    executeWithTimeout(operation, operationId, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // 设置超时定时器
                const timeout = setTimeout(() => {
                    this.timeouts.delete(operationId);
                    const duration = Date.now() - this.states.get(operationId).startTime;
                    reject(new TimeoutError(`Operation timed out after ${duration}ms`, duration, operationId));
                }, config.timeout);
                this.timeouts.set(operationId, timeout);
                // 执行操作
                operation()
                    .then(result => {
                    this.clearTimeout(operationId);
                    resolve(result);
                })
                    .catch(error => {
                    this.clearTimeout(operationId);
                    reject(error);
                });
            });
        });
    }
    // 计算重试延迟
    calculateRetryDelay(baseDelay = 1000, attempt) {
        // 使用指数退避策略
        return Math.min(baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000, 30000 // 最大延迟30秒
        );
    }
    // 延迟执行
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // 清理超时定时器
    clearTimeout(operationId) {
        const timeout = this.timeouts.get(operationId);
        if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(operationId);
        }
    }
    // 清理状态
    cleanup(operationId) {
        this.clearTimeout(operationId);
        this.states.delete(operationId);
    }
    // 获取默认超时时间
    getDefaultTimeout(operationType) {
        return this.defaultTimeouts[operationType];
    }
    // 批量执行带超时的操作
    withTimeoutBatch(operations, config) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(operations.map(op => this.withTimeout(op, config)));
        });
    }
    // 清理所有超时和状态
    dispose() {
        this.timeouts.forEach(clearTimeout);
        this.timeouts.clear();
        this.states.clear();
    }
}
TimeoutManager.instance = null;
exports.timeoutManager = TimeoutManager.getInstance();
