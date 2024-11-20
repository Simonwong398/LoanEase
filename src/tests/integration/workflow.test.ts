import { networkManager } from '../../utils/network';
import { storageManager } from '../../utils/storage';
import { i18nManager } from '../../utils/i18n';
import { themeManager } from '../../utils/theme';
import { routerManager } from '../../utils/router';
import { performance } from 'perf_hooks';
import { jest, describe, it, beforeAll, afterEach, expect } from '@jest/globals';

interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

describe('Integration Tests', () => {
  beforeAll(async () => {
    await storageManager.clear();
    await i18nManager.translate('test');
    await themeManager.setTheme('light');
  });

  afterEach(async () => {
    await storageManager.clear();
  });

  describe('User Workflows', () => {
    it('should handle complete loan calculation workflow', async () => {
      // 1. 设置语言和主题
      await i18nManager.translate('test');
      await themeManager.setTheme('dark');

      // 2. 计算贷款
      const loanData = {
        amount: 100000,
        term: 12,
        rate: 0.05
      };

      const result = await networkManager.request<LoanResult>('/api/calculate', {
        method: 'POST',
        body: JSON.stringify(loanData)
      });

      expect(result).toHaveProperty('monthlyPayment');
      expect(result.monthlyPayment).toBeGreaterThan(0);

      // 3. 保存结果
      await storageManager.setItem('lastCalculation', result);

      // 4. 验证持久化
      const saved = await storageManager.getItem<LoanResult>('lastCalculation');
      expect(saved).toEqual(result);

      // 5. 导出数据
      const exportResult = await networkManager.request<{ url: string }>('/api/export', {
        method: 'POST',
        body: JSON.stringify(result)
      });

      expect(exportResult).toHaveProperty('url');
    });

    it('should handle error scenarios gracefully', async () => {
      // 1. 网络错误
      await expect(
        networkManager.request('/api/nonexistent')
      ).rejects.toThrow();

      // 2. 无效数据
      await expect(
        storageManager.setItem('invalid', { circular: { ref: null } })
      ).rejects.toThrow();

      // 3. 主题切换错误
      await expect(
        themeManager.setTheme({ invalid: 'theme' } as any)
      ).rejects.toThrow();
    });

    it('should handle navigation and state management', async () => {
      // 1. 路由导航
      await routerManager.navigate('/home');
      expect(routerManager.getCurrentRoute()?.path).toBe('/home');

      // 2. 状态更新
      const state = routerManager.getState();
      expect(state.currentRoute?.path).toBe('/home');

      // 3. 路由参数
      await routerManager.navigate('/users/:id', { id: 1 });
      expect(routerManager.getState().params).toEqual({ id: 1 });
    });

    it('should handle request cancellation', async () => {
      const requestId = 'test-request';
      const slowRequest = networkManager.request('/api/slow');
      networkManager.abortRequest(requestId);

      await expect(slowRequest).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent operations efficiently', async () => {
      const startTime = performance.now();
      
      await Promise.all([
        networkManager.request('/api/data1'),
        networkManager.request('/api/data2'),
        networkManager.request('/api/data3'),
        storageManager.setItem('key1', { data: 1 }),
        storageManager.setItem('key2', { data: 2 }),
        i18nManager.translate('test'),
        themeManager.setTheme('dark')
      ]);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(5000); // 5秒内完成
    });

    it('should maintain performance under load', async () => {
      const iterations = 100;
      const results: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        await Promise.all([
          storageManager.setItem(`key${i}`, { data: i }),
          networkManager.request(`/api/data${i}`),
          i % 10 === 0 ? i18nManager.translate('test') : Promise.resolve(),
          i % 20 === 0 ? themeManager.setTheme('light') : Promise.resolve()
        ]);

        const endTime = performance.now();
        results.push(endTime - startTime);
      }

      // 计算性能指标
      const average = results.reduce((a, b) => a + b) / results.length;
      const max = Math.max(...results);
      const min = Math.min(...results);
      const p95 = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

      expect(average).toBeLessThan(100); // 平均耗时小于100ms
      expect(max).toBeLessThan(500);     // 最大耗时小于500ms
      expect(p95).toBeLessThan(200);     // 95%的操作小于200ms
    });

    it('should handle memory usage efficiently', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 1000; i++) {
        await storageManager.setItem(`key${i}`, { data: 'x'.repeat(1000) });
      }

      // 触发垃圾回收
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 内存增长小于50MB
    });

    it('should handle request cancellation', async () => {
      const requestId = 'test-request';
      const slowRequest = networkManager.request('/api/slow');
      networkManager.abortRequest(requestId);

      await expect(slowRequest).rejects.toThrow();
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle race conditions correctly', async () => {
      const results = await Promise.all([
        networkManager.request('/api/data', { cacheKey: 'test' }),
        networkManager.request('/api/data', { cacheKey: 'test' }),
      ]);

      expect(results[0]).toEqual(results[1]); // 应该返回相同的结果
    });

    it('should handle request cancellation', async () => {
      const requestId = 'test-request';
      const slowRequest = networkManager.request('/api/slow');
      networkManager.abortRequest(requestId);

      await expect(slowRequest).rejects.toThrow();
    });

    it('should handle request queue correctly', async () => {
      const requests = Array(10).fill(null).map((_, i) => 
        networkManager.request(`/api/data${i}`, {
          priority: i % 3 // 使用不同的优先级
        })
      );

      const results = await Promise.all(requests);
      expect(results).toHaveLength(10);
    });

    it('should handle concurrent theme changes', async () => {
      const themeChanges = Array(5).fill(null).map((_, i) => 
        themeManager.setTheme(i % 2 === 0 ? 'light' : 'dark')
      );

      await Promise.all(themeChanges);
      expect(['light', 'dark']).toContain(themeManager.getCurrentTheme().name);
    });

    it('should handle concurrent storage operations', async () => {
      const operations = Array(100).fill(null).map((_, i) => ({
        key: `key${i}`,
        value: { data: i }
      }));

      // 随机读写操作
      const promises = operations.map(({ key, value }) => 
        Math.random() > 0.5 ?
          storageManager.setItem(key, value) :
          storageManager.getItem(key)
      );

      await Promise.all(promises);
    });
  });
}); 