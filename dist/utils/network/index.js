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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestPriority = exports.networkManager = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
const cache_1 = require("../cache");
// 请求优先级
var RequestPriority;
(function (RequestPriority) {
    RequestPriority[RequestPriority["HIGH"] = 0] = "HIGH";
    RequestPriority[RequestPriority["NORMAL"] = 1] = "NORMAL";
    RequestPriority[RequestPriority["LOW"] = 2] = "LOW";
})(RequestPriority || (exports.RequestPriority = RequestPriority = {}));
class NetworkManager {
    constructor() {
        this.interceptors = [];
        this.requestQueue = [];
        this.batchRequests = new Map();
        this.activeRequests = new Map();
        this.isProcessingQueue = false;
        this.maxConcurrentRequests = 6;
        this.currentRequests = 0;
        this.startQueueProcessing();
    }
    static getInstance() {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }
    // 添加拦截器
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
    // 发送请求
    request(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, config = {}) {
            const startTime = performance.now();
            const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            try {
                // 检查缓存
                if (config.useCache) {
                    const cached = yield this.checkCache(config.cacheKey || url);
                    if (cached) {
                        return cached;
                    }
                }
                // 批处理请求
                if (config.batch) {
                    return this.batchRequest(url, config);
                }
                // 创建 AbortController
                const controller = new AbortController();
                this.activeRequests.set(requestId, controller);
                // 应用请求拦截器
                let finalConfig = yield this.applyRequestInterceptors(config);
                finalConfig.signal = controller.signal;
                // 添加到请求队列
                const response = yield this.enqueueRequest(url, finalConfig, requestId);
                // 应用响应拦截器
                const interceptedResponse = yield this.applyResponseInterceptors(response);
                // 处理响应
                const data = yield this.handleResponse(interceptedResponse);
                // 缓存响应
                if (config.useCache) {
                    yield this.cacheResponse(config.cacheKey || url, data, config.cacheTTL);
                }
                // 记录性能指标
                yield performance_1.performanceManager.recordMetric('network', 'request', performance.now() - startTime, {
                    url,
                    method: config.method || 'GET',
                    status: interceptedResponse.status
                });
                return data;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                // 应用错误拦截器
                const result = yield this.applyErrorInterceptors(actualError);
                if (result instanceof Response) {
                    return this.handleResponse(result);
                }
                // 重试逻辑
                if (config.retries && config.retries > 0) {
                    return this.retryRequest(url, Object.assign(Object.assign({}, config), { retries: config.retries - 1 }));
                }
                logger_1.logger.error('NetworkManager', 'Request failed', actualError);
                throw actualError;
            }
            finally {
                this.activeRequests.delete(requestId);
            }
        });
    }
    // 取消请求
    cancelRequest(requestId) {
        const controller = this.activeRequests.get(requestId);
        if (controller) {
            controller.abort();
            this.activeRequests.delete(requestId);
        }
    }
    // 取消所有请求
    cancelAllRequests() {
        this.activeRequests.forEach(controller => controller.abort());
        this.activeRequests.clear();
    }
    checkCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield cache_1.cacheManager.get(key);
        });
    }
    cacheResponse(key, data, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            yield cache_1.cacheManager.set(key, data, { ttl });
        });
    }
    batchRequest(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const batchKey = config.batchKey || url;
            return new Promise((resolve, reject) => {
                const queueItem = {
                    priority: config.priority || RequestPriority.NORMAL,
                    timestamp: Date.now(),
                    execute: () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const response = yield this.request(url, Object.assign(Object.assign({}, config), { batch: false }));
                            resolve(response);
                        }
                        catch (error) {
                            reject(error);
                        }
                    })
                };
                const batch = this.batchRequests.get(batchKey) || [];
                batch.push(queueItem);
                this.batchRequests.set(batchKey, batch);
                // 设置批处理延迟
                setTimeout(() => {
                    this.processBatch(batchKey);
                }, config.batchDelay || 50);
            });
        });
    }
    processBatch(batchKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.batchRequests.get(batchKey);
            if (!batch)
                return;
            this.batchRequests.delete(batchKey);
            try {
                yield Promise.all(batch.map(item => item.execute()));
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('NetworkManager', 'Batch processing failed', actualError);
            }
        });
    }
    enqueueRequest(url, config, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const queueItem = {
                    priority: config.priority || RequestPriority.NORMAL,
                    timestamp: Date.now(),
                    execute: () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const response = yield this.executeRequest(url, config);
                            resolve(response);
                        }
                        catch (error) {
                            reject(error);
                        }
                    })
                };
                this.requestQueue.push(queueItem);
                this.sortQueue();
                this.processQueue();
            });
        });
    }
    executeRequest(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { timeout, onProgress, onUploadProgress, onDownloadProgress, useCache, cacheKey, cacheTTL, batch, batchKey, batchDelay, priority, retries, retryDelay } = config, fetchConfig = __rest(config, ["timeout", "onProgress", "onUploadProgress", "onDownloadProgress", "useCache", "cacheKey", "cacheTTL", "batch", "batchKey", "batchDelay", "priority", "retries", "retryDelay"]);
            // 处理超时
            if (timeout) {
                const controller = new AbortController();
                fetchConfig.signal = controller.signal;
                setTimeout(() => controller.abort(), timeout);
            }
            // 处理进度
            if (onProgress || onUploadProgress || onDownloadProgress) {
                return this.executeRequestWithProgress(url, fetchConfig, {
                    onProgress,
                    onUploadProgress,
                    onDownloadProgress
                });
            }
            return fetch(url, fetchConfig);
        });
    }
    executeRequestWithProgress(url, config, callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { onProgress, onUploadProgress, onDownloadProgress } = callbacks;
            // 上传进度
            if (config.body && onUploadProgress) {
                const body = config.body;
                if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
                    // 计算总大小
                    const total = (() => {
                        if (body instanceof FormData) {
                            // 使用类型断言处理 FormData entries
                            const formDataEntries = Array.from(body.entries());
                            return formDataEntries.reduce((acc, [_, value]) => {
                                if (value instanceof Blob) {
                                    return acc + value.size;
                                }
                                return acc + new Blob([String(value)]).size;
                            }, 0);
                        }
                        if (body instanceof Blob) {
                            return body.size;
                        }
                        return body.byteLength;
                    })();
                    let loaded = 0;
                    const stream = new ReadableStream({
                        pull(controller) {
                            const chunk = new Uint8Array(1024);
                            loaded += chunk.length;
                            onUploadProgress(Math.min(loaded / total, 1));
                            controller.enqueue(chunk);
                        }
                    });
                    config.body = stream;
                }
            }
            const response = yield fetch(url, config);
            // 下载进度
            if (onDownloadProgress) {
                const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
                const total = Number(response.headers.get('content-length')) || 0;
                let loaded = 0;
                const stream = new ReadableStream({
                    start(controller) {
                        return __awaiter(this, void 0, void 0, function* () {
                            while (true) {
                                const { done, value } = yield reader.read();
                                if (done)
                                    break;
                                loaded += value.length;
                                onDownloadProgress(loaded / total);
                                controller.enqueue(value);
                            }
                            controller.close();
                        });
                    }
                });
                return new Response(stream, response);
            }
            return response;
        });
    }
    applyRequestInterceptors(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let interceptedConfig = Object.assign({}, config);
            for (const interceptor of this.interceptors) {
                if (interceptor.onRequest) {
                    interceptedConfig = yield interceptor.onRequest(interceptedConfig);
                }
            }
            return interceptedConfig;
        });
    }
    applyResponseInterceptors(response) {
        return __awaiter(this, void 0, void 0, function* () {
            let interceptedResponse = response;
            for (const interceptor of this.interceptors) {
                if (interceptor.onResponse) {
                    interceptedResponse = yield interceptor.onResponse(interceptedResponse);
                }
            }
            return interceptedResponse;
        });
    }
    applyErrorInterceptors(error) {
        return __awaiter(this, void 0, void 0, function* () {
            let interceptedError = error;
            for (const interceptor of this.interceptors) {
                if (interceptor.onError) {
                    interceptedError = yield interceptor.onError(interceptedError);
                }
            }
            return interceptedError;
        });
    }
    handleResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json')) {
                return response.json();
            }
            throw new Error(`Unsupported content type: ${contentType}`);
        });
    }
    retryRequest(url, config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => setTimeout(resolve, config.retryDelay || Math.pow(2, config.retries || 0) * 1000));
            return this.request(url, config);
        });
    }
    startQueueProcessing() {
        setInterval(() => {
            this.processQueue();
        }, 100);
    }
    processQueue() {
        if (this.isProcessingQueue || this.currentRequests >= this.maxConcurrentRequests) {
            return;
        }
        this.isProcessingQueue = true;
        try {
            while (this.requestQueue.length > 0 &&
                this.currentRequests < this.maxConcurrentRequests) {
                const item = this.requestQueue.shift();
                if (!item)
                    break;
                this.currentRequests++;
                item.execute().finally(() => {
                    this.currentRequests--;
                });
            }
        }
        finally {
            this.isProcessingQueue = false;
        }
    }
    sortQueue() {
        this.requestQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.timestamp - b.timestamp;
        });
    }
}
NetworkManager.instance = null;
exports.networkManager = NetworkManager.getInstance();
