export interface PerformanceMetrics {
  // 基础性能指标
  calculationTime: number;      // 计算耗时
  operationsPerSecond: number;  // 每秒操作数
  cacheHitRate: number;         // 缓存命中率
  
  // 内存指标
  memoryUsage: number;         // 内存使用率
  peakMemoryUsage: number;     // 峰值内存使用
  gcCollections: number;       // GC 收集次数
  heapSize: number;           // 堆大小
  
  // 批处理性能
  avgBatchSize: number;        // 平均批大小
  batchThroughput: number;     // 批处理吞吐量
  batchLatency: number;        // 批处理延迟
  batchSuccessRate: number;    // 批处理成功率
  
  // 系统资源
  cpuUsage: number;           // CPU 使用率
  threadCount: number;        // 线程数
  ioOperations: number;       // IO 操作数
  
  // 响应性能
  averageResponseTime: number; // 平均响应时间
  p95ResponseTime: number;     // 95分位响应时间
  p99ResponseTime: number;     // 99分位响应时间
  errorRate: number;          // 错误率
  
  // 缓存性能
  cacheSize: number;          // 缓存大小
  cacheEvictions: number;     // 缓存驱逐次数
  cacheMissRate: number;      // 缓存未命中率
  
  // 异步操作
  pendingOperations: number;  // 待处理操作数
  concurrentOperations: number; // 并发操作数
  operationQueueLength: number; // 操作队列长度
  
  // 网络性能
  networkLatency: number;     // 网络延迟
  networkThroughput: number;  // 网络吞吐量
  activeConnections: number;  // 活动连接数
}

class PerformanceMetricsCollector {
  private static instance: PerformanceMetricsCollector;
  private metrics: PerformanceMetrics = this.initializeMetrics();
  private startTime: number = Date.now();
  private operationCount: number = 0;
  private responseTimes: number[] = [];
  private readonly RESPONSE_TIME_WINDOW = 1000; // 保留最近1000个响应时间样本

  private constructor() {
    this.startPerformanceMonitoring();
  }

  static getInstance(): PerformanceMetricsCollector {
    if (!PerformanceMetricsCollector.instance) {
      PerformanceMetricsCollector.instance = new PerformanceMetricsCollector();
    }
    return PerformanceMetricsCollector.instance;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      calculationTime: 0,
      operationsPerSecond: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      gcCollections: 0,
      heapSize: 0,
      avgBatchSize: 0,
      batchThroughput: 0,
      batchLatency: 0,
      batchSuccessRate: 0,
      cpuUsage: 0,
      threadCount: 1,
      ioOperations: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      cacheSize: 0,
      cacheEvictions: 0,
      cacheMissRate: 0,
      pendingOperations: 0,
      concurrentOperations: 0,
      operationQueueLength: 0,
      networkLatency: 0,
      networkThroughput: 0,
      activeConnections: 0,
    };
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }

  private updateMetrics() {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - this.startTime) / 1000;
    
    // 更新基础指标
    this.metrics.operationsPerSecond = this.operationCount / elapsedTime;
    this.metrics.memoryUsage = this.getMemoryUsage();
    this.metrics.cpuUsage = this.getCPUUsage();
    
    // 更新响应时间指标
    if (this.responseTimes.length > 0) {
      const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
      this.metrics.averageResponseTime = sortedTimes.reduce((a, b) => a + b) / sortedTimes.length;
      this.metrics.p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      this.metrics.p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    }

    // 更新内存指标
    if (typeof window !== 'undefined' && window.performance?.memory) {
      this.metrics.heapSize = window.performance.memory.totalJSHeapSize;
      this.metrics.peakMemoryUsage = Math.max(
        this.metrics.peakMemoryUsage,
        window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit
      );
    }

    // 更新缓存指标
    this.metrics.cacheMissRate = 1 - this.metrics.cacheHitRate;
  }

  recordOperation(type: string, duration: number, success: boolean = true) {
    this.operationCount++;
    this.metrics.calculationTime += duration;
    this.responseTimes.push(duration);
    
    // 保持响应时间窗口大小
    if (this.responseTimes.length > this.RESPONSE_TIME_WINDOW) {
      this.responseTimes.shift();
    }
    
    // 更新错误率
    const totalOps = this.operationCount;
    const errorOps = this.metrics.errorRate * (totalOps - 1) + (success ? 0 : 1);
    this.metrics.errorRate = errorOps / totalOps;

    if (duration > 100) {
      console.warn(`Long operation detected: ${type} took ${duration}ms`);
    }
  }

  recordBatch(size: number, duration: number, successCount: number) {
    this.metrics.avgBatchSize = (this.metrics.avgBatchSize + size) / 2;
    this.metrics.batchThroughput = size / (duration / 1000);
    this.metrics.batchLatency = duration / size;
    this.metrics.batchSuccessRate = successCount / size;
  }

  recordCacheOperation(hit: boolean, size: number, evicted: boolean) {
    this.metrics.cacheHitRate = hit ? 
      (this.metrics.cacheHitRate * this.operationCount + 1) / (this.operationCount + 1) :
      (this.metrics.cacheHitRate * this.operationCount) / (this.operationCount + 1);
    
    this.metrics.cacheSize = size;
    if (evicted) {
      this.metrics.cacheEvictions++;
    }
  }

  recordAsyncOperation(pending: number, concurrent: number, queueLength: number) {
    this.metrics.pendingOperations = pending;
    this.metrics.concurrentOperations = concurrent;
    this.metrics.operationQueueLength = queueLength;
  }

  recordNetworkMetrics(latency: number, throughput: number, connections: number) {
    this.metrics.networkLatency = latency;
    this.metrics.networkThroughput = throughput;
    this.metrics.activeConnections = connections;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();
    this.operationCount = 0;
    this.responseTimes = [];
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && window.performance?.memory) {
      return window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit;
    }
    return 0;
  }

  private getCPUUsage(): number {
    return Math.min(this.metrics.operationsPerSecond / 1000, 1);
  }
}

export const performanceMetricsCollector = PerformanceMetricsCollector.getInstance(); 