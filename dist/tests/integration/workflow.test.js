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
const network_1 = require("../../utils/network");
const storage_1 = require("../../utils/storage");
const i18n_1 = require("../../utils/i18n");
const theme_1 = require("../../utils/theme");
const router_1 = require("../../utils/router");
const perf_hooks_1 = require("perf_hooks");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Integration Tests', () => {
    (0, globals_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield storage_1.storageManager.clear();
        yield i18n_1.i18nManager.translate('test');
        yield theme_1.themeManager.setTheme('light');
    }));
    (0, globals_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield storage_1.storageManager.clear();
    }));
    (0, globals_1.describe)('User Workflows', () => {
        (0, globals_1.it)('should handle complete loan calculation workflow', () => __awaiter(void 0, void 0, void 0, function* () {
            // 1. 设置语言和主题
            yield i18n_1.i18nManager.translate('test');
            yield theme_1.themeManager.setTheme('dark');
            // 2. 计算贷款
            const loanData = {
                amount: 100000,
                term: 12,
                rate: 0.05
            };
            const result = yield network_1.networkManager.request('/api/calculate', {
                method: 'POST',
                body: JSON.stringify(loanData)
            });
            (0, globals_1.expect)(result).toHaveProperty('monthlyPayment');
            (0, globals_1.expect)(result.monthlyPayment).toBeGreaterThan(0);
            // 3. 保存结果
            yield storage_1.storageManager.setItem('lastCalculation', result);
            // 4. 验证持久化
            const saved = yield storage_1.storageManager.getItem('lastCalculation');
            (0, globals_1.expect)(saved).toEqual(result);
            // 5. 导出数据
            const exportResult = yield network_1.networkManager.request('/api/export', {
                method: 'POST',
                body: JSON.stringify(result)
            });
            (0, globals_1.expect)(exportResult).toHaveProperty('url');
        }));
        (0, globals_1.it)('should handle error scenarios gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // 1. 网络错误
            yield (0, globals_1.expect)(network_1.networkManager.request('/api/nonexistent')).rejects.toThrow();
            // 2. 无效数据
            yield (0, globals_1.expect)(storage_1.storageManager.setItem('invalid', { circular: { ref: null } })).rejects.toThrow();
            // 3. 主题切换错误
            yield (0, globals_1.expect)(theme_1.themeManager.setTheme({ invalid: 'theme' })).rejects.toThrow();
        }));
        (0, globals_1.it)('should handle navigation and state management', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // 1. 路由导航
            yield router_1.routerManager.navigate('/home');
            (0, globals_1.expect)((_a = router_1.routerManager.getCurrentRoute()) === null || _a === void 0 ? void 0 : _a.path).toBe('/home');
            // 2. 状态更新
            const state = router_1.routerManager.getState();
            (0, globals_1.expect)((_b = state.currentRoute) === null || _b === void 0 ? void 0 : _b.path).toBe('/home');
            // 3. 路由参数
            yield router_1.routerManager.navigate('/users/:id', { id: 1 });
            (0, globals_1.expect)(router_1.routerManager.getState().params).toEqual({ id: 1 });
        }));
        (0, globals_1.it)('should handle request cancellation', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestId = 'test-request';
            const slowRequest = network_1.networkManager.request('/api/slow');
            network_1.networkManager.abortRequest(requestId);
            yield (0, globals_1.expect)(slowRequest).rejects.toThrow();
        }));
    });
    (0, globals_1.describe)('Performance Tests', () => {
        (0, globals_1.it)('should handle concurrent operations efficiently', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = perf_hooks_1.performance.now();
            yield Promise.all([
                network_1.networkManager.request('/api/data1'),
                network_1.networkManager.request('/api/data2'),
                network_1.networkManager.request('/api/data3'),
                storage_1.storageManager.setItem('key1', { data: 1 }),
                storage_1.storageManager.setItem('key2', { data: 2 }),
                i18n_1.i18nManager.translate('test'),
                theme_1.themeManager.setTheme('dark')
            ]);
            const endTime = perf_hooks_1.performance.now();
            (0, globals_1.expect)(endTime - startTime).toBeLessThan(5000); // 5秒内完成
        }));
        (0, globals_1.it)('should maintain performance under load', () => __awaiter(void 0, void 0, void 0, function* () {
            const iterations = 100;
            const results = [];
            for (let i = 0; i < iterations; i++) {
                const startTime = perf_hooks_1.performance.now();
                yield Promise.all([
                    storage_1.storageManager.setItem(`key${i}`, { data: i }),
                    network_1.networkManager.request(`/api/data${i}`),
                    i % 10 === 0 ? i18n_1.i18nManager.translate('test') : Promise.resolve(),
                    i % 20 === 0 ? theme_1.themeManager.setTheme('light') : Promise.resolve()
                ]);
                const endTime = perf_hooks_1.performance.now();
                results.push(endTime - startTime);
            }
            // 计算性能指标
            const average = results.reduce((a, b) => a + b) / results.length;
            const max = Math.max(...results);
            const min = Math.min(...results);
            const p95 = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];
            (0, globals_1.expect)(average).toBeLessThan(100); // 平均耗时小于100ms
            (0, globals_1.expect)(max).toBeLessThan(500); // 最大耗时小于500ms
            (0, globals_1.expect)(p95).toBeLessThan(200); // 95%的操作小于200ms
        }));
        (0, globals_1.it)('should handle memory usage efficiently', () => __awaiter(void 0, void 0, void 0, function* () {
            const initialMemory = process.memoryUsage().heapUsed;
            for (let i = 0; i < 1000; i++) {
                yield storage_1.storageManager.setItem(`key${i}`, { data: 'x'.repeat(1000) });
            }
            // 触发垃圾回收
            if (global.gc) {
                global.gc();
            }
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            (0, globals_1.expect)(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 内存增长小于50MB
        }));
        (0, globals_1.it)('should handle request cancellation', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestId = 'test-request';
            const slowRequest = network_1.networkManager.request('/api/slow');
            network_1.networkManager.abortRequest(requestId);
            yield (0, globals_1.expect)(slowRequest).rejects.toThrow();
        }));
    });
    (0, globals_1.describe)('Concurrency Tests', () => {
        (0, globals_1.it)('should handle race conditions correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const results = yield Promise.all([
                network_1.networkManager.request('/api/data', { cacheKey: 'test' }),
                network_1.networkManager.request('/api/data', { cacheKey: 'test' }),
            ]);
            (0, globals_1.expect)(results[0]).toEqual(results[1]); // 应该返回相同的结果
        }));
        (0, globals_1.it)('should handle request cancellation', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestId = 'test-request';
            const slowRequest = network_1.networkManager.request('/api/slow');
            network_1.networkManager.abortRequest(requestId);
            yield (0, globals_1.expect)(slowRequest).rejects.toThrow();
        }));
        (0, globals_1.it)('should handle request queue correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const requests = Array(10).fill(null).map((_, i) => network_1.networkManager.request(`/api/data${i}`, {
                priority: i % 3 // 使用不同的优先级
            }));
            const results = yield Promise.all(requests);
            (0, globals_1.expect)(results).toHaveLength(10);
        }));
        (0, globals_1.it)('should handle concurrent theme changes', () => __awaiter(void 0, void 0, void 0, function* () {
            const themeChanges = Array(5).fill(null).map((_, i) => theme_1.themeManager.setTheme(i % 2 === 0 ? 'light' : 'dark'));
            yield Promise.all(themeChanges);
            (0, globals_1.expect)(['light', 'dark']).toContain(theme_1.themeManager.getCurrentTheme().name);
        }));
        (0, globals_1.it)('should handle concurrent storage operations', () => __awaiter(void 0, void 0, void 0, function* () {
            const operations = Array(100).fill(null).map((_, i) => ({
                key: `key${i}`,
                value: { data: i }
            }));
            // 随机读写操作
            const promises = operations.map(({ key, value }) => Math.random() > 0.5 ?
                storage_1.storageManager.setItem(key, value) :
                storage_1.storageManager.getItem(key));
            yield Promise.all(promises);
        }));
    });
});
