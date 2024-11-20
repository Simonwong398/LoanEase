"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = exports.errorMiddleware = exports.performanceMiddleware = exports.loggerMiddleware = exports.createMiddleware = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
class Store {
    constructor(reducer, initialState, middlewares = []) {
        this.subscribers = new Set();
        this.snapshots = [];
        this.maxSnapshots = 50;
        this.isDispatching = false;
        this.selectors = new Map();
        this.selectorCache = new Map();
        this.state = initialState;
        this.reducer = reducer;
        this.middlewares = middlewares;
        this.createSnapshot('initial');
    }
    // 获取当前状态
    getState() {
        if (this.isDispatching) {
            throw new Error('Cannot get state while dispatching');
        }
        return Object.freeze(Object.assign({}, this.state));
    }
    // 派发动作
    dispatch(action) {
        const startTime = performance.now();
        try {
            if (this.isDispatching) {
                throw new Error('Cannot dispatch action while dispatching');
            }
            this.isDispatching = true;
            // 应用中间件
            const chain = this.middlewares.map(middleware => middleware(this));
            const dispatch = chain.reduce((next, middleware) => middleware(next), (action) => {
                const nextState = this.reducer(this.state, action);
                if (nextState !== this.state) {
                    const prevState = this.state;
                    this.state = nextState;
                    this.notifySubscribers();
                    this.createSnapshot(action.type, action);
                    this.clearSelectorCache();
                    logger_1.logger.info('Store', 'State updated', {
                        action: action.type,
                        changed: this.getChangedPaths(prevState, nextState)
                    });
                }
            });
            dispatch(action);
            performance_1.performanceManager.recordMetric('store', 'dispatch', performance.now() - startTime, {
                action: action.type
            });
        }
        catch (error) {
            const actualError = error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('Store', 'Dispatch failed', actualError);
            throw actualError;
        }
        finally {
            this.isDispatching = false;
        }
    }
    // 订阅状态变更
    subscribe(subscriber) {
        this.subscribers.add(subscriber);
        return () => {
            this.subscribers.delete(subscriber);
        };
    }
    // 注册选择器
    registerSelector(name, selector, deps = []) {
        this.selectors.set(name, selector);
        this.selectorCache.set(name, {
            value: selector(this.state),
            deps
        });
    }
    // 使用选择器
    select(selectorOrName) {
        if (typeof selectorOrName === 'string') {
            const selector = this.selectors.get(selectorOrName);
            if (!selector) {
                throw new Error(`Selector "${selectorOrName}" not found`);
            }
            const cached = this.selectorCache.get(selectorOrName);
            if (cached) {
                return cached.value;
            }
            const value = selector(this.state);
            this.selectorCache.set(selectorOrName, { value, deps: [] });
            return value;
        }
        return selectorOrName(this.state);
    }
    // 创建状态快照
    createSnapshot(type, action) {
        const snapshot = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            state: Object.assign({}, this.state),
            timestamp: Date.now(),
            action
        };
        this.snapshots.push(snapshot);
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }
    }
    // 获取快照
    getSnapshots() {
        return [...this.snapshots];
    }
    // 恢复到快照
    restoreSnapshot(id) {
        const snapshot = this.snapshots.find(s => s.id === id);
        if (!snapshot) {
            throw new Error(`Snapshot "${id}" not found`);
        }
        this.state = Object.assign({}, snapshot.state);
        this.notifySubscribers();
        this.clearSelectorCache();
        this.createSnapshot('restore');
    }
    // 通知订阅者
    notifySubscribers() {
        const state = this.getState();
        this.subscribers.forEach(subscriber => {
            try {
                subscriber(state);
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('Store', 'Subscriber error', actualError);
            }
        });
    }
    // 清除选择器缓存
    clearSelectorCache() {
        this.selectorCache.clear();
    }
    // 获取变更的路径
    getChangedPaths(prevState, nextState, path = '') {
        const changes = [];
        const compareValues = (prev, next, currentPath) => {
            if (prev === next)
                return;
            if (typeof prev !== 'object' || typeof next !== 'object') {
                changes.push(currentPath);
                return;
            }
            const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
            keys.forEach(key => {
                const newPath = currentPath ? `${currentPath}.${key}` : key;
                compareValues(prev[key], next[key], newPath);
            });
        };
        compareValues(prevState, nextState, path);
        return changes;
    }
    // 清理资源
    dispose() {
        this.subscribers.clear();
        this.snapshots = [];
        this.selectorCache.clear();
    }
}
exports.Store = Store;
// 创建中间件
const createMiddleware = (handler) => handler;
exports.createMiddleware = createMiddleware;
// 日志中间件
exports.loggerMiddleware = (0, exports.createMiddleware)(store => next => action => {
    logger_1.logger.info('Store', 'Action dispatched', {
        type: action.type,
        payload: action.payload
    });
    next(action);
});
// 性能监控中间件
exports.performanceMiddleware = (0, exports.createMiddleware)(store => next => action => {
    const startTime = performance.now();
    next(action);
    const duration = performance.now() - startTime;
    performance_1.performanceManager.recordMetric('store', 'action', duration, {
        type: action.type
    });
});
// 错误处理中间件
exports.errorMiddleware = (0, exports.createMiddleware)(store => next => action => {
    try {
        next(action);
    }
    catch (error) {
        const actualError = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('Store', 'Action error', actualError);
        throw actualError;
    }
});
