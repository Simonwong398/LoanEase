import { logger } from '../logger';
import { performanceManager } from '../performance';

// 状态变更类型
type ActionType = string;

// 状态变更接口
interface Action<T = any> {
  type: ActionType;
  payload?: T;
  meta?: Record<string, unknown>;
}

// 状态变更处理器
type Reducer<S, A extends Action = Action> = (state: S, action: A) => S;

// 中间件类型
type Middleware<S> = (store: Store<S>) => 
  (next: (action: Action) => void) => 
  (action: Action) => void;

// 订阅函数类型
type Subscriber<S> = (state: S) => void;

// 选择器类型
type Selector<S, R> = (state: S) => R;

// 状态快照
interface StateSnapshot<S> {
  id: string;
  state: S;
  timestamp: number;
  action?: Action;
}

class Store<S> {
  private state: S;
  private readonly reducer: Reducer<S>;
  private readonly middlewares: Middleware<S>[];
  private subscribers: Set<Subscriber<S>> = new Set();
  private snapshots: StateSnapshot<S>[] = [];
  private readonly maxSnapshots = 50;
  private isDispatching = false;
  private readonly selectors = new Map<string, Selector<S, any>>();
  private readonly selectorCache = new Map<string, { value: any; deps: any[] }>();

  constructor(
    reducer: Reducer<S>,
    initialState: S,
    middlewares: Middleware<S>[] = []
  ) {
    this.state = initialState;
    this.reducer = reducer;
    this.middlewares = middlewares;
    this.createSnapshot('initial');
  }

  // 获取当前状态
  getState(): Readonly<S> {
    if (this.isDispatching) {
      throw new Error('Cannot get state while dispatching');
    }
    return Object.freeze({ ...this.state });
  }

  // 派发动作
  dispatch<T>(action: Action<T>): void {
    const startTime = performance.now();

    try {
      if (this.isDispatching) {
        throw new Error('Cannot dispatch action while dispatching');
      }

      this.isDispatching = true;

      // 应用中间件
      const chain = this.middlewares.map(middleware => middleware(this));
      const dispatch = chain.reduce(
        (next, middleware) => middleware(next),
        (action: Action) => {
          const nextState = this.reducer(this.state, action);
          if (nextState !== this.state) {
            const prevState = this.state;
            this.state = nextState;
            this.notifySubscribers();
            this.createSnapshot(action.type, action);
            this.clearSelectorCache();
            logger.info('Store', 'State updated', {
              action: action.type,
              changed: this.getChangedPaths(prevState, nextState)
            });
          }
        }
      );

      dispatch(action);

      performanceManager.recordMetric('store', 'dispatch', performance.now() - startTime, {
        action: action.type
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('Store', 'Dispatch failed', actualError);
      throw actualError;
    } finally {
      this.isDispatching = false;
    }
  }

  // 订阅状态变更
  subscribe(subscriber: Subscriber<S>): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  // 注册选择器
  registerSelector<R>(
    name: string,
    selector: Selector<S, R>,
    deps: any[] = []
  ): void {
    this.selectors.set(name, selector);
    this.selectorCache.set(name, {
      value: selector(this.state),
      deps
    });
  }

  // 使用选择器
  select<R>(selectorOrName: Selector<S, R> | string): R {
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
  private createSnapshot(type: string, action?: Action): void {
    const snapshot: StateSnapshot<S> = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      state: { ...this.state },
      timestamp: Date.now(),
      action
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  // 获取快照
  getSnapshots(): ReadonlyArray<StateSnapshot<S>> {
    return [...this.snapshots];
  }

  // 恢复到快照
  restoreSnapshot(id: string): void {
    const snapshot = this.snapshots.find(s => s.id === id);
    if (!snapshot) {
      throw new Error(`Snapshot "${id}" not found`);
    }

    this.state = { ...snapshot.state };
    this.notifySubscribers();
    this.clearSelectorCache();
    this.createSnapshot('restore');
  }

  // 通知订阅者
  private notifySubscribers(): void {
    const state = this.getState();
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(state);
      } catch (error) {
        const actualError = error instanceof Error ? error : new Error(String(error));
        logger.error('Store', 'Subscriber error', actualError);
      }
    });
  }

  // 清除选择器缓存
  private clearSelectorCache(): void {
    this.selectorCache.clear();
  }

  // 获取变更的路径
  private getChangedPaths(
    prevState: S,
    nextState: S,
    path: string = ''
  ): string[] {
    const changes: string[] = [];

    const compareValues = (prev: any, next: any, currentPath: string) => {
      if (prev === next) return;
      
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
  dispose(): void {
    this.subscribers.clear();
    this.snapshots = [];
    this.selectorCache.clear();
  }
}

// 创建中间件
export const createMiddleware = <S>(
  handler: (store: Store<S>) => (next: (action: Action) => void) => (action: Action) => void
): Middleware<S> => handler;

// 日志中间件
export const loggerMiddleware = createMiddleware(store => next => action => {
  logger.info('Store', 'Action dispatched', {
    type: action.type,
    payload: action.payload
  });
  next(action);
});

// 性能监控中间件
export const performanceMiddleware = createMiddleware(store => next => action => {
  const startTime = performance.now();
  next(action);
  const duration = performance.now() - startTime;
  performanceManager.recordMetric('store', 'action', duration, {
    type: action.type
  });
});

// 错误处理中间件
export const errorMiddleware = createMiddleware(store => next => action => {
  try {
    next(action);
  } catch (error) {
    const actualError = error instanceof Error ? error : new Error(String(error));
    logger.error('Store', 'Action error', actualError);
    throw actualError;
  }
});

export type { Action, Reducer, Middleware, Subscriber, Selector, StateSnapshot };
export { Store }; 