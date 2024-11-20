import { logger } from '../logger';
import { performanceManager } from '../performance';

// 测试类型定义
export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  PERFORMANCE = 'performance',
  STRESS = 'stress'
}

// 测试状态
export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// 测试结果
interface TestResult {
  id: string;
  type: TestType;
  name: string;
  status: TestStatus;
  duration: number;
  error?: Error;
  memoryUsage?: number;
  cpuUsage?: number;
  assertions: Array<{
    name: string;
    passed: boolean;
    error?: Error;
  }>;
}

// 性能指标
interface PerformanceMetrics {
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  p95ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

// 压力测试配置
interface StressTestConfig {
  duration: number;
  concurrentUsers: number;
  rampUpTime: number;
  requestsPerSecond: number;
  maxVirtualUsers: number;
  thresholds: {
    maxResponseTime: number;
    maxErrorRate: number;
    maxCpuUsage: number;
    maxMemoryUsage: number;
  };
}

interface IntegrationTest {
  name: string;
  setup?: () => Promise<void>;
  test: () => Promise<void>;
  teardown?: () => Promise<void>;
  dependencies?: string[];
}

class TestManager {
  private static instance: TestManager | null = null;
  private readonly testResults = new Map<string, TestResult>();
  private readonly performanceResults = new Map<string, PerformanceMetrics>();
  private currentTest: TestResult | null = null;

  private constructor() {}

  static getInstance(): TestManager {
    if (!TestManager.instance) {
      TestManager.instance = new TestManager();
    }
    return TestManager.instance;
  }

  // 运行集成测试
  async runIntegrationTests(tests: IntegrationTest[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const startTime = performance.now();

    try {
      // 按依赖顺序排序测试
      const sortedTests = this.sortTestsByDependencies(tests);

      for (const test of sortedTests) {
        const testResult = await this.runSingleIntegrationTest(test);
        results.push(testResult);

        // 如果测试失败且有依赖，跳过依赖的测试
        if (testResult.status === TestStatus.FAILED) {
          const dependentTests = this.findDependentTests(test.name, sortedTests);
          for (const depTest of dependentTests) {
            results.push({
              id: `test_${Date.now()}`,
              type: TestType.INTEGRATION,
              name: depTest.name,
              status: TestStatus.SKIPPED,
              duration: 0,
              assertions: []
            });
          }
        }
      }

      await performanceManager.recordMetric('testing', 'integration', performance.now() - startTime, {
        totalTests: tests.length,
        passedTests: results.filter(r => r.status === TestStatus.PASSED).length
      });

      return results;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('TestManager', 'Integration tests failed', actualError);
      throw actualError;
    }
  }

  // 运行端到端测试
  async runE2ETests(tests: Array<{
    name: string;
    steps: Array<() => Promise<void>>;
    cleanup?: () => Promise<void>;
  }>): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const startTime = performance.now();

    try {
      for (const test of tests) {
        const testResult = await this.runSingleE2ETest(test);
        results.push(testResult);
      }

      await performanceManager.recordMetric('testing', 'e2e', performance.now() - startTime, {
        totalTests: tests.length,
        passedTests: results.filter(r => r.status === TestStatus.PASSED).length
      });

      return results;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('TestManager', 'E2E tests failed', actualError);
      throw actualError;
    }
  }

  // 运行性能测试
  async runPerformanceTests(tests: Array<{
    name: string;
    test: () => Promise<void>;
    iterations: number;
    warmup?: number;
  }>): Promise<Map<string, PerformanceMetrics>> {
    const results = new Map<string, PerformanceMetrics>();
    const startTime = performance.now();

    try {
      for (const test of tests) {
        // 预热
        if (test.warmup) {
          for (let i = 0; i < test.warmup; i++) {
            await test.test();
          }
        }

        const metrics = await this.measurePerformance(test);
        results.set(test.name, metrics);
      }

      await performanceManager.recordMetric('testing', 'performance', performance.now() - startTime, {
        totalTests: tests.length,
        metrics: Array.from(results.entries())
      });

      return results;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('TestManager', 'Performance tests failed', actualError);
      throw actualError;
    }
  }

  // 运行压力测试
  async runStressTests(tests: Array<{
    name: string;
    test: () => Promise<void>;
    config: StressTestConfig;
  }>): Promise<Map<string, PerformanceMetrics>> {
    const results = new Map<string, PerformanceMetrics>();
    const startTime = performance.now();

    try {
      for (const test of tests) {
        const metrics = await this.runStressTest(test);
        results.set(test.name, metrics);
      }

      await performanceManager.recordMetric('testing', 'stress', performance.now() - startTime, {
        totalTests: tests.length,
        metrics: Array.from(results.entries())
      });

      return results;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('TestManager', 'Stress tests failed', actualError);
      throw actualError;
    }
  }

  private async runSingleIntegrationTest(test: IntegrationTest): Promise<TestResult> {
    const testResult: TestResult = {
      id: `test_${Date.now()}`,
      type: TestType.INTEGRATION,
      name: test.name,
      status: TestStatus.RUNNING,
      duration: 0,
      assertions: []
    };

    const startTime = performance.now();

    try {
      // 设置
      if (test.setup) {
        await test.setup();
      }

      // 运行测试
      await test.test();

      testResult.status = TestStatus.PASSED;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      testResult.status = TestStatus.FAILED;
      testResult.error = actualError;
    } finally {
      // 清理
      if (test.teardown) {
        try {
          await test.teardown();
        } catch (error) {
          const actualError = error instanceof Error ? error : new Error(String(error));
          logger.error('TestManager', `Teardown failed for test: ${test.name}`, actualError);
        }
      }

      testResult.duration = performance.now() - startTime;
    }

    return testResult;
  }

  private async runSingleE2ETest(test: {
    name: string;
    steps: Array<() => Promise<void>>;
    cleanup?: () => Promise<void>;
  }): Promise<TestResult> {
    const testResult: TestResult = {
      id: `test_${Date.now()}`,
      type: TestType.E2E,
      name: test.name,
      status: TestStatus.RUNNING,
      duration: 0,
      assertions: []
    };

    const startTime = performance.now();

    try {
      // 执行测试步骤
      for (const step of test.steps) {
        await step();
      }

      testResult.status = TestStatus.PASSED;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      testResult.status = TestStatus.FAILED;
      testResult.error = actualError;
    } finally {
      // 清理
      if (test.cleanup) {
        try {
          await test.cleanup();
        } catch (error) {
          const actualError = error instanceof Error ? error : new Error(String(error));
          logger.error('TestManager', `Cleanup failed for test: ${test.name}`, actualError);
        }
      }

      testResult.duration = performance.now() - startTime;
    }

    return testResult;
  }

  private async measurePerformance(test: {
    name: string;
    test: () => Promise<void>;
    iterations: number;
  }): Promise<PerformanceMetrics> {
    const durations: number[] = [];
    const memoryUsages: number[] = [];
    const cpuUsages: number[] = [];
    let errors = 0;

    for (let i = 0; i < test.iterations; i++) {
      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;
      const startCpu = process.cpuUsage();

      try {
        await test.test();
      } catch (error) {
        errors++;
      }

      durations.push(performance.now() - startTime);
      memoryUsages.push(process.memoryUsage().heapUsed - startMemory);
      const cpuUsage = process.cpuUsage(startCpu);
      cpuUsages.push((cpuUsage.user + cpuUsage.system) / 1000000); // 转换为毫秒
    }

    return {
      averageResponseTime: this.average(durations),
      maxResponseTime: Math.max(...durations),
      minResponseTime: Math.min(...durations),
      p95ResponseTime: this.percentile(durations, 95),
      requestsPerSecond: test.iterations / (this.sum(durations) / 1000),
      errorRate: errors / test.iterations,
      memoryUsage: this.average(memoryUsages),
      cpuUsage: this.average(cpuUsages)
    };
  }

  private async runStressTest(test: {
    name: string;
    test: () => Promise<void>;
    config: StressTestConfig;
  }): Promise<PerformanceMetrics> {
    const durations: number[] = [];
    const memoryUsages: number[] = [];
    const cpuUsages: number[] = [];
    let errors = 0;
    let activeUsers = 0;

    const startTime = Date.now();
    const endTime = startTime + test.config.duration;

    while (Date.now() < endTime) {
      // 计算当前应该的用户数
      const elapsedTime = Date.now() - startTime;
      const targetUsers = Math.min(
        test.config.maxVirtualUsers,
        Math.floor((elapsedTime / test.config.rampUpTime) * test.config.concurrentUsers)
      );

      // 创建新用户
      while (activeUsers < targetUsers) {
        this.runVirtualUser(test, durations, memoryUsages, cpuUsages, errors);
        activeUsers++;
      }

      // 检查阈值
      const currentMetrics = this.calculateCurrentMetrics(durations, memoryUsages, cpuUsages, errors);
      if (this.isThresholdExceeded(currentMetrics, test.config.thresholds)) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.calculateCurrentMetrics(durations, memoryUsages, cpuUsages, errors);
  }

  private async runVirtualUser(
    test: { test: () => Promise<void> },
    durations: number[],
    memoryUsages: number[],
    cpuUsages: number[],
    errors: number
  ): Promise<void> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();

    try {
      await test.test();
    } catch (error) {
      errors++;
    }

    durations.push(performance.now() - startTime);
    memoryUsages.push(process.memoryUsage().heapUsed - startMemory);
    const cpuUsage = process.cpuUsage(startCpu);
    cpuUsages.push((cpuUsage.user + cpuUsage.system) / 1000000);
  }

  private calculateCurrentMetrics(
    durations: number[],
    memoryUsages: number[],
    cpuUsages: number[],
    errors: number
  ): PerformanceMetrics {
    return {
      averageResponseTime: this.average(durations),
      maxResponseTime: Math.max(...durations),
      minResponseTime: Math.min(...durations),
      p95ResponseTime: this.percentile(durations, 95),
      requestsPerSecond: durations.length / (this.sum(durations) / 1000),
      errorRate: errors / durations.length,
      memoryUsage: this.average(memoryUsages),
      cpuUsage: this.average(cpuUsages)
    };
  }

  private isThresholdExceeded(
    metrics: PerformanceMetrics,
    thresholds: StressTestConfig['thresholds']
  ): boolean {
    return (
      metrics.maxResponseTime > thresholds.maxResponseTime ||
      metrics.errorRate > thresholds.maxErrorRate ||
      metrics.cpuUsage > thresholds.maxCpuUsage ||
      metrics.memoryUsage > thresholds.maxMemoryUsage
    );
  }

  private sortTestsByDependencies(tests: IntegrationTest[]): IntegrationTest[] {
    const visited = new Set<string>();
    const sorted: IntegrationTest[] = [];

    const visit = (test: IntegrationTest) => {
      if (visited.has(test.name)) return;
      visited.add(test.name);

      if (test.dependencies) {
        for (const dep of test.dependencies) {
          const depTest = tests.find(t => t.name === dep);
          if (depTest) {
            visit(depTest);
          }
        }
      }

      sorted.push(test);
    };

    tests.forEach(visit);
    return sorted;
  }

  private findDependentTests(
    testName: string,
    tests: IntegrationTest[]
  ): IntegrationTest[] {
    return tests.filter(test => 
      test.dependencies?.includes(testName)
    );
  }

  private average(numbers: number[]): number {
    return numbers.length === 0 ? 0 : this.sum(numbers) / numbers.length;
  }

  private sum(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
  }

  private percentile(numbers: number[], p: number): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * p / 100;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }
}

export const testManager = TestManager.getInstance();
export type { TestResult, PerformanceMetrics, StressTestConfig }; 