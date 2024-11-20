import { logger } from '../logger';
import { performanceManager } from '../performance';
import { cacheManager } from '../cache';

// 请求优先级
enum RequestPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2
}

// 请求配置
interface RequestConfig {
  // 标准 fetch 配置
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal;

  // 自定义配置
  priority?: RequestPriority;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  batch?: boolean;
  batchKey?: string;
  batchDelay?: number;
  onProgress?: (progress: number) => void;
  onUploadProgress?: (progress: number) => void;
  onDownloadProgress?: (progress: number) => void;
}

// 请求拦截器
interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
  onResponse?: (response: Response) => Promise<Response> | Response;
  onError?: (error: Error) => Promise<Error | Response> | Error | Response;
}

// 请求队列项
interface QueueItem {
  priority: RequestPriority;
  timestamp: number;
  execute: () => Promise<any>;
}

class NetworkManager {
  private static instance: NetworkManager | null = null;
  private readonly interceptors: RequestInterceptor[] = [];
  private readonly requestQueue: QueueItem[] = [];
  private readonly batchRequests = new Map<string, QueueItem[]>();
  private readonly activeRequests = new Map<string, AbortController>();
  private isProcessingQueue = false;
  private maxConcurrentRequests = 6;
  private currentRequests = 0;

  private constructor() {
    this.startQueueProcessing();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  // 添加拦截器
  addInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }

  // 发送请求
  async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const startTime = performance.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 检查缓存
      if (config.useCache) {
        const cached = await this.checkCache<T>(config.cacheKey || url);
        if (cached) {
          return cached;
        }
      }

      // 批处理请求
      if (config.batch) {
        return this.batchRequest<T>(url, config);
      }

      // 创建 AbortController
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);

      // 应用请求拦截器
      let finalConfig = await this.applyRequestInterceptors(config);
      finalConfig.signal = controller.signal;

      // 添加到请求队列
      const response = await this.enqueueRequest<T>(url, finalConfig, requestId);

      // 应用响应拦截器
      const interceptedResponse = await this.applyResponseInterceptors(response);

      // 处理响应
      const data = await this.handleResponse<T>(interceptedResponse);

      // 缓存响应
      if (config.useCache) {
        await this.cacheResponse(config.cacheKey || url, data, config.cacheTTL);
      }

      // 记录性能指标
      await performanceManager.recordMetric('network', 'request', performance.now() - startTime, {
        url,
        method: config.method || 'GET',
        status: interceptedResponse.status
      });

      return data;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      
      // 应用错误拦截器
      const result = await this.applyErrorInterceptors(actualError);
      
      if (result instanceof Response) {
        return this.handleResponse<T>(result);
      }
      
      // 重试逻辑
      if (config.retries && config.retries > 0) {
        return this.retryRequest<T>(url, {
          ...config,
          retries: config.retries - 1
        });
      }

      logger.error('NetworkManager', 'Request failed', actualError);
      throw actualError;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  // 取消请求
  cancelRequest(requestId: string): void {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }

  private async checkCache<T>(key: string): Promise<T | undefined> {
    return await cacheManager.get<T>(key);
  }

  private async cacheResponse<T>(key: string, data: T, ttl?: number): Promise<void> {
    await cacheManager.set(key, data, { ttl });
  }

  private async batchRequest<T>(url: string, config: RequestConfig): Promise<T> {
    const batchKey = config.batchKey || url;
    
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        priority: config.priority || RequestPriority.NORMAL,
        timestamp: Date.now(),
        execute: async () => {
          try {
            const response = await this.request<T>(url, {
              ...config,
              batch: false
            });
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }
      };

      const batch = this.batchRequests.get(batchKey) || [];
      batch.push(queueItem);
      this.batchRequests.set(batchKey, batch);

      // 设置批处理延迟
      setTimeout(() => {
        this.processBatch(batchKey);
      }, config.batchDelay || 50);
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batchRequests.get(batchKey);
    if (!batch) return;

    this.batchRequests.delete(batchKey);
    
    try {
      await Promise.all(batch.map(item => item.execute()));
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('NetworkManager', 'Batch processing failed', actualError);
    }
  }

  private async enqueueRequest<T>(
    url: string,
    config: RequestConfig,
    requestId: string
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        priority: config.priority || RequestPriority.NORMAL,
        timestamp: Date.now(),
        execute: async () => {
          try {
            const response = await this.executeRequest(url, config);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }
      };

      this.requestQueue.push(queueItem);
      this.sortQueue();
      this.processQueue();
    });
  }

  private async executeRequest(url: string, config: RequestConfig): Promise<Response> {
    const { 
      timeout, 
      onProgress, 
      onUploadProgress, 
      onDownloadProgress,
      useCache,
      cacheKey,
      cacheTTL,
      batch,
      batchKey,
      batchDelay,
      priority,
      retries,
      retryDelay,
      ...fetchConfig 
    } = config;

    // 处理超时
    if (timeout) {
      const controller = new AbortController();
      fetchConfig.signal = controller.signal;
      setTimeout(() => controller.abort(), timeout);
    }

    // 处理进度
    if (onProgress || onUploadProgress || onDownloadProgress) {
      return this.executeRequestWithProgress(url, fetchConfig as RequestInit, {
        onProgress,
        onUploadProgress,
        onDownloadProgress
      });
    }

    return fetch(url, fetchConfig as RequestInit);
  }

  private async executeRequestWithProgress(
    url: string,
    config: RequestInit,
    callbacks: {
      onProgress?: (progress: number) => void;
      onUploadProgress?: (progress: number) => void;
      onDownloadProgress?: (progress: number) => void;
    }
  ): Promise<Response> {
    const { onProgress, onUploadProgress, onDownloadProgress } = callbacks;

    // 上传进度
    if (config.body && onUploadProgress) {
      const body = config.body;
      if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
        // 计算总大小
        const total: number = (() => {
          if (body instanceof FormData) {
            // 使用类型断言处理 FormData entries
            const formDataEntries = Array.from((body as any).entries()) as Array<[string, string | Blob]>;
            return formDataEntries.reduce((acc: number, [_, value]) => {
              if (value instanceof Blob) {
                return acc + value.size;
              }
              return acc + new Blob([String(value)]).size;
            }, 0);
          }
          if (body instanceof Blob) {
            return body.size;
          }
          return (body as ArrayBuffer).byteLength;
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

    const response = await fetch(url, config);

    // 下载进度
    if (onDownloadProgress) {
      const reader = response.body?.getReader();
      const total = Number(response.headers.get('content-length')) || 0;
      let loaded = 0;

      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            loaded += value.length;
            onDownloadProgress(loaded / total);
            controller.enqueue(value);
          }
          controller.close();
        }
      });

      return new Response(stream, response);
    }

    return response;
  }

  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let interceptedConfig = { ...config };

    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        interceptedConfig = await interceptor.onRequest(interceptedConfig);
      }
    }

    return interceptedConfig;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let interceptedResponse = response;

    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        interceptedResponse = await interceptor.onResponse(interceptedResponse);
      }
    }

    return interceptedResponse;
  }

  private async applyErrorInterceptors(error: Error): Promise<Error | Response> {
    let interceptedError: Error | Response = error;

    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        interceptedError = await interceptor.onError(interceptedError as Error);
      }
    }

    return interceptedError;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  private async retryRequest<T>(url: string, config: RequestConfig): Promise<T> {
    await new Promise(resolve => 
      setTimeout(resolve, config.retryDelay || Math.pow(2, config.retries || 0) * 1000)
    );
    return this.request<T>(url, config);
  }

  private startQueueProcessing(): void {
    setInterval(() => {
      this.processQueue();
    }, 100);
  }

  private processQueue(): void {
    if (this.isProcessingQueue || this.currentRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (
        this.requestQueue.length > 0 &&
        this.currentRequests < this.maxConcurrentRequests
      ) {
        const item = this.requestQueue.shift();
        if (!item) break;

        this.currentRequests++;
        item.execute().finally(() => {
          this.currentRequests--;
        });
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private sortQueue(): void {
    this.requestQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }
}

export const networkManager = NetworkManager.getInstance();
export { RequestPriority };
export type { RequestConfig, RequestInterceptor }; 