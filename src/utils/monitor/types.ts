// 基础类型
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export interface JsonObject { [key: string]: JsonValue }
export interface JsonArray extends Array<JsonValue> {}

// 错误码定义
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  RESOURCE_ERROR: 'RESOURCE_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export interface ErrorCodeDefinition {
  readonly code: ErrorCode;
  readonly message: string;
  readonly suggestion: string;
  readonly docs: string;
}

export type ErrorCodeMap = {
  readonly [K in ErrorCode]: ErrorCodeDefinition;
};

// 错误详情类型
export interface ErrorDetails {
  readonly code: ErrorCode;
  readonly message: string;
  readonly timestamp: number;
  readonly context?: Readonly<Record<string, JsonValue>>;
  readonly stack?: string;
  readonly suggestion?: string;
  readonly docs?: string;
  readonly errorId: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly recoverable: boolean;
  readonly userAction?: string;
  readonly technicalDetails?: string;
}

// 事件监控类型
export interface EventMetric {
  readonly id: string;
  readonly name: string;
  readonly timestamp: number;
  readonly category: string;
  readonly status: 'success' | 'error' | 'warning' | 'info';
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export interface EventPattern {
  readonly name: string;
  readonly timeWindow: number;
  readonly threshold: number;
  readonly action: (events: ReadonlyArray<EventMetric>) => void;
}

// 性能监控类型
export type PerformanceMetricType = 'network' | 'render' | 'computation' | 'io';

export interface PerformanceMetric {
  readonly id: string;
  readonly name: string;
  readonly type: PerformanceMetricType;
  readonly startTime: number;
  readonly duration: number;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

// 内存监控类型
export interface MemorySnapshot {
  readonly timestamp: number;
  readonly heapUsed: number;
  readonly heapTotal: number;
  readonly external: number;
  readonly arrayBuffers: number;
  readonly rss: number;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

// 监控配置类型
export interface MonitorConfig {
  enabled: boolean;
  readonly sampleRate: number;
  readonly maxEntries: number;
  readonly cleanupInterval: number;
}

// 监控统计类型
export interface MonitorStats {
  readonly total: number;
  readonly success: number;
  readonly error: number;
  readonly warning: number;
  readonly avgDuration?: number;
  readonly percentiles?: {
    readonly p50: number;
    readonly p90: number;
    readonly p95: number;
    readonly p99: number;
  };
}

// 监控过滤器类型
export interface MonitorFilter<T> {
  readonly startTime?: number;
  readonly endTime?: number;
  readonly categories?: ReadonlyArray<string>;
  readonly statuses?: ReadonlyArray<string>;
  readonly predicate?: (item: T) => boolean;
}

// 监控结果类型
export interface MonitorResult<T> {
  readonly success: boolean;
  readonly timestamp: number;
  readonly duration?: number;
  readonly data?: T;
  readonly error?: ErrorDetails;
}

// 工具类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 添加 IMonitor 接口导出
export interface IMonitor<T> {
  readonly isEnabled: boolean;
  enable(): void;
  disable(): void;
  record(data: T): void;
  getEntries(filter?: MonitorFilter<T>): ReadonlyArray<T>;
  getStats(timeWindow?: number): Readonly<MonitorStats>;
  clear(): void;
  dispose(): void;
} 