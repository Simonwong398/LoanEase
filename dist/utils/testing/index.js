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
exports.testManager = exports.TestStatus = exports.TestType = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
// 测试类型定义
var TestType;
(function (TestType) {
    TestType["UNIT"] = "unit";
    TestType["INTEGRATION"] = "integration";
    TestType["E2E"] = "e2e";
    TestType["PERFORMANCE"] = "performance";
    TestType["STRESS"] = "stress";
})(TestType || (exports.TestType = TestType = {}));
// 测试状态
var TestStatus;
(function (TestStatus) {
    TestStatus["PENDING"] = "pending";
    TestStatus["RUNNING"] = "running";
    TestStatus["PASSED"] = "passed";
    TestStatus["FAILED"] = "failed";
    TestStatus["SKIPPED"] = "skipped";
})(TestStatus || (exports.TestStatus = TestStatus = {}));
class TestManager {
    constructor() {
        this.testResults = new Map();
        this.performanceResults = new Map();
        this.currentTest = null;
    }
    static getInstance() {
        if (!TestManager.instance) {
            TestManager.instance = new TestManager();
        }
        return TestManager.instance;
    }
    // 运行集成测试
    runIntegrationTests(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const startTime = performance.now();
            try {
                // 按依赖顺序排序测试
                const sortedTests = this.sortTestsByDependencies(tests);
                for (const test of sortedTests) {
                    const testResult = yield this.runSingleIntegrationTest(test);
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
                yield performance_1.performanceManager.recordMetric('testing', 'integration', performance.now() - startTime, {
                    totalTests: tests.length,
                    passedTests: results.filter(r => r.status === TestStatus.PASSED).length
                });
                return results;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('TestManager', 'Integration tests failed', actualError);
                throw actualError;
            }
        });
    }
    // 运行端到端测试
    runE2ETests(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const startTime = performance.now();
            try {
                for (const test of tests) {
                    const testResult = yield this.runSingleE2ETest(test);
                    results.push(testResult);
                }
                yield performance_1.performanceManager.recordMetric('testing', 'e2e', performance.now() - startTime, {
                    totalTests: tests.length,
                    passedTests: results.filter(r => r.status === TestStatus.PASSED).length
                });
                return results;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('TestManager', 'E2E tests failed', actualError);
                throw actualError;
            }
        });
    }
    // 运行性能测试
    runPerformanceTests(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = new Map();
            const startTime = performance.now();
            try {
                for (const test of tests) {
                    // 预热
                    if (test.warmup) {
                        for (let i = 0; i < test.warmup; i++) {
                            yield test.test();
                        }
                    }
                    const metrics = yield this.measurePerformance(test);
                    results.set(test.name, metrics);
                }
                yield performance_1.performanceManager.recordMetric('testing', 'performance', performance.now() - startTime, {
                    totalTests: tests.length,
                    metrics: Array.from(results.entries())
                });
                return results;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('TestManager', 'Performance tests failed', actualError);
                throw actualError;
            }
        });
    }
    // 运行压力测试
    runStressTests(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = new Map();
            const startTime = performance.now();
            try {
                for (const test of tests) {
                    const metrics = yield this.runStressTest(test);
                    results.set(test.name, metrics);
                }
                yield performance_1.performanceManager.recordMetric('testing', 'stress', performance.now() - startTime, {
                    totalTests: tests.length,
                    metrics: Array.from(results.entries())
                });
                return results;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('TestManager', 'Stress tests failed', actualError);
                throw actualError;
            }
        });
    }
    runSingleIntegrationTest(test) {
        return __awaiter(this, void 0, void 0, function* () {
            const testResult = {
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
                    yield test.setup();
                }
                // 运行测试
                yield test.test();
                testResult.status = TestStatus.PASSED;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                testResult.status = TestStatus.FAILED;
                testResult.error = actualError;
            }
            finally {
                // 清理
                if (test.teardown) {
                    try {
                        yield test.teardown();
                    }
                    catch (error) {
                        const actualError = error instanceof Error ? error : new Error(String(error));
                        logger_1.logger.error('TestManager', `Teardown failed for test: ${test.name}`, actualError);
                    }
                }
                testResult.duration = performance.now() - startTime;
            }
            return testResult;
        });
    }
    runSingleE2ETest(test) {
        return __awaiter(this, void 0, void 0, function* () {
            const testResult = {
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
                    yield step();
                }
                testResult.status = TestStatus.PASSED;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                testResult.status = TestStatus.FAILED;
                testResult.error = actualError;
            }
            finally {
                // 清理
                if (test.cleanup) {
                    try {
                        yield test.cleanup();
                    }
                    catch (error) {
                        const actualError = error instanceof Error ? error : new Error(String(error));
                        logger_1.logger.error('TestManager', `Cleanup failed for test: ${test.name}`, actualError);
                    }
                }
                testResult.duration = performance.now() - startTime;
            }
            return testResult;
        });
    }
    measurePerformance(test) {
        return __awaiter(this, void 0, void 0, function* () {
            const durations = [];
            const memoryUsages = [];
            const cpuUsages = [];
            let errors = 0;
            for (let i = 0; i < test.iterations; i++) {
                const startTime = performance.now();
                const startMemory = process.memoryUsage().heapUsed;
                const startCpu = process.cpuUsage();
                try {
                    yield test.test();
                }
                catch (error) {
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
        });
    }
    runStressTest(test) {
        return __awaiter(this, void 0, void 0, function* () {
            const durations = [];
            const memoryUsages = [];
            const cpuUsages = [];
            let errors = 0;
            let activeUsers = 0;
            const startTime = Date.now();
            const endTime = startTime + test.config.duration;
            while (Date.now() < endTime) {
                // 计算当前应该的用户数
                const elapsedTime = Date.now() - startTime;
                const targetUsers = Math.min(test.config.maxVirtualUsers, Math.floor((elapsedTime / test.config.rampUpTime) * test.config.concurrentUsers));
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
                yield new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.calculateCurrentMetrics(durations, memoryUsages, cpuUsages, errors);
        });
    }
    runVirtualUser(test, durations, memoryUsages, cpuUsages, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            const startMemory = process.memoryUsage().heapUsed;
            const startCpu = process.cpuUsage();
            try {
                yield test.test();
            }
            catch (error) {
                errors++;
            }
            durations.push(performance.now() - startTime);
            memoryUsages.push(process.memoryUsage().heapUsed - startMemory);
            const cpuUsage = process.cpuUsage(startCpu);
            cpuUsages.push((cpuUsage.user + cpuUsage.system) / 1000000);
        });
    }
    calculateCurrentMetrics(durations, memoryUsages, cpuUsages, errors) {
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
    isThresholdExceeded(metrics, thresholds) {
        return (metrics.maxResponseTime > thresholds.maxResponseTime ||
            metrics.errorRate > thresholds.maxErrorRate ||
            metrics.cpuUsage > thresholds.maxCpuUsage ||
            metrics.memoryUsage > thresholds.maxMemoryUsage);
    }
    sortTestsByDependencies(tests) {
        const visited = new Set();
        const sorted = [];
        const visit = (test) => {
            if (visited.has(test.name))
                return;
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
    findDependentTests(testName, tests) {
        return tests.filter(test => { var _a; return (_a = test.dependencies) === null || _a === void 0 ? void 0 : _a.includes(testName); });
    }
    average(numbers) {
        return numbers.length === 0 ? 0 : this.sum(numbers) / numbers.length;
    }
    sum(numbers) {
        return numbers.reduce((a, b) => a + b, 0);
    }
    percentile(numbers, p) {
        if (numbers.length === 0)
            return 0;
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
TestManager.instance = null;
exports.testManager = TestManager.getInstance();
