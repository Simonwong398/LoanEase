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
exports.routerManager = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
class RouterManager {
    constructor() {
        this.routes = new Map();
        this.guards = [];
        this.state = {
            currentRoute: null,
            previousRoute: null,
            history: [],
            params: {},
            query: {}
        };
        this.listeners = new Map();
        this.isNavigating = false;
        this.handlePopState = (event) => __awaiter(this, void 0, void 0, function* () {
            const { path, params, query } = this.parseUrl(window.location.pathname + window.location.search);
            yield this.navigate(path, { params, query, replace: true });
        });
        this.initialize();
    }
    static getInstance() {
        if (!RouterManager.instance) {
            RouterManager.instance = new RouterManager();
        }
        return RouterManager.instance;
    }
    initialize() {
        try {
            // 监听浏览器历史记录变化
            window.addEventListener('popstate', this.handlePopState);
            // 处理初始路由
            this.handleInitialRoute();
            logger_1.logger.info('RouterManager', 'Initialized successfully');
        }
        catch (error) {
            const actualError = error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('RouterManager', 'Initialization failed', actualError);
        }
    }
    // 注册路由
    registerRoutes(routes) {
        try {
            this.processRoutes(routes);
            logger_1.logger.info('RouterManager', 'Routes registered', {
                count: this.routes.size
            });
        }
        catch (error) {
            const actualError = error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('RouterManager', 'Failed to register routes', actualError);
            throw actualError;
        }
    }
    // 添加路由守卫
    addGuard(guard) {
        this.guards.push(guard);
    }
    // 导航到指定路由
    navigate(path_1) {
        return __awaiter(this, arguments, void 0, function* (path, options = {}) {
            var _a, _b;
            const startTime = performance.now();
            try {
                if (this.isNavigating) {
                    logger_1.logger.warn('RouterManager', 'Navigation cancelled - already navigating');
                    return false;
                }
                this.isNavigating = true;
                // 查找目标路由
                const targetRoute = this.findRoute(path);
                if (!targetRoute) {
                    throw new Error(`Route not found: ${path}`);
                }
                // 触发导航前事件
                yield this.emit('beforeNavigate', targetRoute, this.state.currentRoute);
                // 执行路由守卫
                const canNavigate = yield this.runGuards(targetRoute);
                if (!canNavigate) {
                    logger_1.logger.info('RouterManager', 'Navigation cancelled by guard');
                    return false;
                }
                // 更新状态
                const previousRoute = this.state.currentRoute;
                this.state = Object.assign(Object.assign({}, this.state), { previousRoute, currentRoute: targetRoute, params: options.params || {}, query: options.query || {} });
                // 更新历史记录
                if (!options.replace) {
                    this.state.history.push(targetRoute);
                }
                // 更新 URL
                const url = this.buildUrl(path, options.params, options.query);
                if (options.replace) {
                    window.history.replaceState(null, '', url);
                }
                else {
                    window.history.pushState(null, '', url);
                }
                // 更新页面标题
                if ((_a = targetRoute.meta) === null || _a === void 0 ? void 0 : _a.title) {
                    document.title = targetRoute.meta.title;
                }
                // 触发导航后事件
                yield this.emit('afterNavigate', targetRoute, previousRoute);
                yield performance_1.performanceManager.recordMetric('router', 'navigate', performance.now() - startTime, {
                    from: previousRoute === null || previousRoute === void 0 ? void 0 : previousRoute.path,
                    to: targetRoute.path,
                    success: true
                });
                return true;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('RouterManager', 'Navigation failed', actualError);
                yield this.emit('error', actualError);
                yield performance_1.performanceManager.recordMetric('router', 'navigate', performance.now() - startTime, {
                    from: (_b = this.state.currentRoute) === null || _b === void 0 ? void 0 : _b.path,
                    to: path,
                    success: false,
                    error: actualError.message
                });
                return false;
            }
            finally {
                this.isNavigating = false;
            }
        });
    }
    // 返回上一页
    back() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.history.length > 1) {
                window.history.back();
                return true;
            }
            return false;
        });
    }
    // 获取当前路由状态
    getState() {
        return Object.assign({}, this.state);
    }
    // 监听路由事件
    on(event, callback) {
        const listeners = this.listeners.get(event) || new Set();
        listeners.add(callback);
        this.listeners.set(event, listeners);
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }
    processRoutes(routes, parentPath = '') {
        routes.forEach(route => {
            const fullPath = this.joinPaths(parentPath, route.path);
            this.routes.set(fullPath, Object.assign(Object.assign({}, route), { path: fullPath }));
            if (route.children) {
                this.processRoutes(route.children, fullPath);
            }
        });
    }
    joinPaths(parent, child) {
        const normalizedParent = parent.endsWith('/') ? parent.slice(0, -1) : parent;
        const normalizedChild = child.startsWith('/') ? child : `/${child}`;
        return `${normalizedParent}${normalizedChild}`;
    }
    findRoute(path) {
        // 精确匹配
        if (this.routes.has(path)) {
            return this.routes.get(path);
        }
        // 参数路由匹配
        for (const [routePath, route] of this.routes.entries()) {
            if (this.matchRoute(routePath, path)) {
                return route;
            }
        }
        return undefined;
    }
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) {
            return false;
        }
        return patternParts.every((part, index) => {
            if (part.startsWith(':')) {
                return true;
            }
            return part === pathParts[index];
        });
    }
    runGuards(targetRoute) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentRoute = this.state.currentRoute;
            for (const guard of this.guards) {
                if (guard.beforeEach) {
                    const canNavigate = yield guard.beforeEach(targetRoute, currentRoute);
                    if (!canNavigate) {
                        return false;
                    }
                }
            }
            return true;
        });
    }
    buildUrl(path, params, query) {
        let url = path;
        // 替换路径参数
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url = url.replace(`:${key}`, encodeURIComponent(value));
            });
        }
        // 添加查询参数
        if (query && Object.keys(query).length > 0) {
            const queryString = Object.entries(query)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            url += `?${queryString}`;
        }
        return url;
    }
    parseUrl(url) {
        const [pathWithParams, queryString] = url.split('?');
        const params = {};
        const query = {};
        // 解析查询参数
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                    query[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            });
        }
        // 解析路径参数
        const route = Array.from(this.routes.entries()).find(([pattern]) => this.matchRoute(pattern, pathWithParams));
        if (route) {
            const [pattern, config] = route;
            const patternParts = pattern.split('/');
            const pathParts = pathWithParams.split('/');
            patternParts.forEach((part, index) => {
                if (part.startsWith(':')) {
                    const paramName = part.slice(1);
                    params[paramName] = decodeURIComponent(pathParts[index]);
                }
            });
        }
        return {
            path: pathWithParams,
            params,
            query
        };
    }
    handleInitialRoute() {
        const { path, params, query } = this.parseUrl(window.location.pathname + window.location.search);
        this.navigate(path, { params, query, replace: true }).catch(error => {
            logger_1.logger.error('RouterManager', 'Failed to handle initial route', error);
        });
    }
    emit(event, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const listeners = this.listeners.get(event);
            if (listeners) {
                for (const listener of listeners) {
                    try {
                        yield listener(...args);
                    }
                    catch (error) {
                        const actualError = error instanceof Error ? error : new Error(String(error));
                        logger_1.logger.error('RouterManager', `Error in ${event} listener`, actualError);
                    }
                }
            }
        });
    }
    // 清理资源
    dispose() {
        window.removeEventListener('popstate', this.handlePopState);
        this.routes.clear();
        this.guards = [];
        this.listeners.clear();
        this.state = {
            currentRoute: null,
            previousRoute: null,
            history: [],
            params: {},
            query: {}
        };
    }
}
RouterManager.instance = null;
exports.routerManager = RouterManager.getInstance();
