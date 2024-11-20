import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { performanceMonitor } from '../index';
import { performance } from 'perf_hooks';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Operation Tracking', () => {
    it('should track single operation duration', () => {
      performanceMonitor.startOperation('test-op', 'computation');
      jest.advanceTimersByTime(100);
      performanceMonitor.endOperation('test-op', 'computation');

      const metrics = performanceMonitor.getMetrics('computation');
      expect(metrics.length).toBe(1);
      expect(metrics[0].duration).toBeGreaterThanOrEqual(100);
    });

    it('should handle concurrent operations', () => {
      performanceMonitor.startOperation('op1', 'network');
      jest.advanceTimersByTime(50);
      performanceMonitor.startOperation('op2', 'network');
      jest.advanceTimersByTime(100);
      performanceMonitor.endOperation('op1', 'network');
      jest.advanceTimersByTime(50);
      performanceMonitor.endOperation('op2', 'network');

      const metrics = performanceMonitor.getMetrics('network');
      expect(metrics.length).toBe(2);
      expect(metrics[0].duration).toBeGreaterThanOrEqual(150);
      expect(metrics[1].duration).toBeGreaterThanOrEqual(150);
    });

    it('should track different operation types', () => {
      performanceMonitor.startOperation('render', 'render');
      jest.advanceTimersByTime(16);
      performanceMonitor.endOperation('render', 'render');

      performanceMonitor.startOperation('fetch', 'network');
      jest.advanceTimersByTime(200);
      performanceMonitor.endOperation('fetch', 'network');

      const renderMetrics = performanceMonitor.getMetrics('render');
      const networkMetrics = performanceMonitor.getMetrics('network');

      expect(renderMetrics.length).toBe(1);
      expect(networkMetrics.length).toBe(1);
    });
  });

  describe('Performance Thresholds', () => {
    it('should detect slow operations', () => {
      const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});

      performanceMonitor.startOperation('slow-op', 'network');
      jest.advanceTimersByTime(2000); // 2 seconds
      performanceMonitor.endOperation('slow-op', 'network');

      expect(mockLogger).toHaveBeenCalled();
      mockLogger.mockRestore();
    });

    it('should respect custom thresholds', () => {
      const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});

      performanceMonitor.setThreshold('render', 10);
      performanceMonitor.startOperation('render', 'render');
      jest.advanceTimersByTime(20);
      performanceMonitor.endOperation('render', 'render');

      expect(mockLogger).toHaveBeenCalled();
      mockLogger.mockRestore();
    });

    it('should not warn for operations within threshold', () => {
      const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});

      performanceMonitor.startOperation('fast-op', 'computation');
      jest.advanceTimersByTime(50);
      performanceMonitor.endOperation('fast-op', 'computation');

      expect(mockLogger).not.toHaveBeenCalled();
      mockLogger.mockRestore();
    });
  });

  describe('Metric Analysis', () => {
    it('should calculate average duration', () => {
      for (let i = 0; i < 5; i++) {
        performanceMonitor.startOperation('repeated-op', 'computation');
        jest.advanceTimersByTime(100);
        performanceMonitor.endOperation('repeated-op', 'computation');
      }

      const metrics = performanceMonitor.getMetrics('computation');
      const average = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      expect(average).toBeGreaterThanOrEqual(100);
    });

    it('should track operation metadata', () => {
      performanceMonitor.startOperation('op-with-meta', 'network');
      jest.advanceTimersByTime(100);
      performanceMonitor.endOperation('op-with-meta', 'network', {
        url: 'https://api.example.com',
        method: 'GET'
      });

      const metrics = performanceMonitor.getMetrics('network');
      expect(metrics[0].metadata).toEqual({
        url: 'https://api.example.com',
        method: 'GET'
      });
    });

    it('should handle operation batches', () => {
      const operations = Array(10).fill(null).map((_, i) => ({
        name: `batch-op-${i}`,
        duration: 50 + Math.floor(Math.random() * 100)
      }));

      operations.forEach(op => {
        performanceMonitor.startOperation(op.name, 'computation');
        jest.advanceTimersByTime(op.duration);
        performanceMonitor.endOperation(op.name, 'computation');
      });

      const metrics = performanceMonitor.getMetrics('computation');
      expect(metrics.length).toBe(10);
    });
  });

  describe('Resource Cleanup', () => {
    it('should clear metrics', () => {
      performanceMonitor.startOperation('test', 'computation');
      jest.advanceTimersByTime(100);
      performanceMonitor.endOperation('test', 'computation');

      performanceMonitor.clearMetrics();
      expect(performanceMonitor.getMetrics().length).toBe(0);
    });

    it('should handle incomplete operations', () => {
      performanceMonitor.startOperation('incomplete', 'network');
      jest.advanceTimersByTime(100);
      // No endOperation call

      const metrics = performanceMonitor.getMetrics('network');
      expect(metrics.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid operation types', () => {
      expect(() => {
        performanceMonitor.startOperation('test', 'invalid' as any);
      }).toThrow();
    });

    it('should handle ending non-existent operations', () => {
      expect(() => {
        performanceMonitor.endOperation('non-existent', 'network');
      }).not.toThrow();
    });

    it('should handle duplicate operation starts', () => {
      performanceMonitor.startOperation('duplicate', 'computation');
      expect(() => {
        performanceMonitor.startOperation('duplicate', 'computation');
      }).not.toThrow();
    });
  });
}); 