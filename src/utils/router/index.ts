import { logger } from '../logger';
import { performanceManager } from '../performance';

// 路由配置接口
interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  strict?: boolean;
  name?: string;
  meta?: {
    auth?: boolean;
    title?: string;
    roles?: string[];
    permissions?: string[];
    transition?: string;
    keepAlive?: boolean;
  };
  children?: RouteConfig[];
}

// 路由守卫接口
interface RouteGuard {
  beforeEach?: (to: RouteConfig, from: RouteConfig | null) => Promise<boolean> | boolean;
  afterEach?: (to: RouteConfig, from: RouteConfig | null) => void;
}

// 路由状态接口
interface RouterState {
  currentRoute: RouteConfig | null;
  previousRoute: RouteConfig | null;
  history: RouteConfig[];
  params: Record<string, string>;
  query: Record<string, string>;
}

// 路由事件类型
type RouterEventType = 'beforeNavigate' | 'afterNavigate' | 'error';

class RouterManager {
  private static instance: RouterManager | null = null;
  private routes: Map<string, RouteConfig> = new Map();
  private guards: RouteGuard[] = [];
  private state: RouterState = {
    currentRoute: null,
    previousRoute: null,
    history: [],
    params: {},
    query: {}
  };
  private listeners: Map<RouterEventType, Set<Function>> = new Map();
  private isNavigating = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): RouterManager {
    if (!RouterManager.instance) {
      RouterManager.instance = new RouterManager();
    }
    return RouterManager.instance;
  }

  private initialize(): void {
    try {
      // 监听浏览器历史记录变化
      window.addEventListener('popstate', this.handlePopState);

      // 处理初始路由
      this.handleInitialRoute();

      logger.info('RouterManager', 'Initialized successfully');
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('RouterManager', 'Initialization failed', actualError);
    }
  }

  // 注册路由
  registerRoutes(routes: RouteConfig[]): void {
    try {
      this.processRoutes(routes);
      logger.info('RouterManager', 'Routes registered', {
        count: this.routes.size
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('RouterManager', 'Failed to register routes', actualError);
      throw actualError;
    }
  }

  // 添加路由守卫
  addGuard(guard: RouteGuard): void {
    this.guards.push(guard);
  }

  // 导航到指定路由
  async navigate(
    path: string,
    options: {
      replace?: boolean;
      params?: Record<string, string>;
      query?: Record<string, string>;
    } = {}
  ): Promise<boolean> {
    const startTime = performance.now();

    try {
      if (this.isNavigating) {
        logger.warn('RouterManager', 'Navigation cancelled - already navigating');
        return false;
      }

      this.isNavigating = true;

      // 查找目标路由
      const targetRoute = this.findRoute(path);
      if (!targetRoute) {
        throw new Error(`Route not found: ${path}`);
      }

      // 触发导航前事件
      await this.emit('beforeNavigate', targetRoute, this.state.currentRoute);

      // 执行路由守卫
      const canNavigate = await this.runGuards(targetRoute);
      if (!canNavigate) {
        logger.info('RouterManager', 'Navigation cancelled by guard');
        return false;
      }

      // 更新状态
      const previousRoute = this.state.currentRoute;
      this.state = {
        ...this.state,
        previousRoute,
        currentRoute: targetRoute,
        params: options.params || {},
        query: options.query || {}
      };

      // 更新历史记录
      if (!options.replace) {
        this.state.history.push(targetRoute);
      }

      // 更新 URL
      const url = this.buildUrl(path, options.params, options.query);
      if (options.replace) {
        window.history.replaceState(null, '', url);
      } else {
        window.history.pushState(null, '', url);
      }

      // 更新页面标题
      if (targetRoute.meta?.title) {
        document.title = targetRoute.meta.title;
      }

      // 触发导航后事件
      await this.emit('afterNavigate', targetRoute, previousRoute);

      await performanceManager.recordMetric('router', 'navigate', performance.now() - startTime, {
        from: previousRoute?.path,
        to: targetRoute.path,
        success: true
      });

      return true;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('RouterManager', 'Navigation failed', actualError);
      await this.emit('error', actualError);

      await performanceManager.recordMetric('router', 'navigate', performance.now() - startTime, {
        from: this.state.currentRoute?.path,
        to: path,
        success: false,
        error: actualError.message
      });

      return false;
    } finally {
      this.isNavigating = false;
    }
  }

  // 返回上一页
  async back(): Promise<boolean> {
    if (this.state.history.length > 1) {
      window.history.back();
      return true;
    }
    return false;
  }

  // 获取当前路由状态
  getState(): Readonly<RouterState> {
    return { ...this.state };
  }

  // 监听路由事件
  on(event: RouterEventType, callback: Function): () => void {
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

  private processRoutes(routes: RouteConfig[], parentPath: string = ''): void {
    routes.forEach(route => {
      const fullPath = this.joinPaths(parentPath, route.path);
      this.routes.set(fullPath, { ...route, path: fullPath });

      if (route.children) {
        this.processRoutes(route.children, fullPath);
      }
    });
  }

  private joinPaths(parent: string, child: string): string {
    const normalizedParent = parent.endsWith('/') ? parent.slice(0, -1) : parent;
    const normalizedChild = child.startsWith('/') ? child : `/${child}`;
    return `${normalizedParent}${normalizedChild}`;
  }

  private findRoute(path: string): RouteConfig | undefined {
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

  private matchRoute(pattern: string, path: string): boolean {
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

  private async runGuards(targetRoute: RouteConfig): Promise<boolean> {
    const currentRoute = this.state.currentRoute;

    for (const guard of this.guards) {
      if (guard.beforeEach) {
        const canNavigate = await guard.beforeEach(targetRoute, currentRoute);
        if (!canNavigate) {
          return false;
        }
      }
    }

    return true;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string>,
    query?: Record<string, string>
  ): string {
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

  private parseUrl(url: string): {
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
  } {
    const [pathWithParams, queryString] = url.split('?');
    const params: Record<string, string> = {};
    const query: Record<string, string> = {};

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
    const route = Array.from(this.routes.entries()).find(([pattern]) =>
      this.matchRoute(pattern, pathWithParams)
    );

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

  private handlePopState = async (event: PopStateEvent): Promise<void> => {
    const { path, params, query } = this.parseUrl(window.location.pathname + window.location.search);
    await this.navigate(path, { params, query, replace: true });
  };

  private handleInitialRoute(): void {
    const { path, params, query } = this.parseUrl(window.location.pathname + window.location.search);
    this.navigate(path, { params, query, replace: true }).catch(error => {
      logger.error('RouterManager', 'Failed to handle initial route', error);
    });
  }

  private async emit(
    event: RouterEventType,
    ...args: any[]
  ): Promise<void> {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          await listener(...args);
        } catch (error) {
          const actualError = error instanceof Error ? error : new Error(String(error));
          logger.error('RouterManager', `Error in ${event} listener`, actualError);
        }
      }
    }
  }

  // 清理资源
  dispose(): void {
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

export const routerManager = RouterManager.getInstance();
export type { RouteConfig, RouteGuard, RouterState, RouterEventType }; 