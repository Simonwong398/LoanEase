import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { memoryMonitor } from '../index';
import type { SpyInstance } from 'jest-mock';

describe('MemoryMonitor', () => {
  let mockMemoryUsage: SpyInstance;
  let mockLogger: SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockMemoryUsage = jest.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 100 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
      rss: 200 * 1024 * 1024,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    mockLogger.mockRestore();
    mockMemoryUsage.mockRestore();
    memoryMonitor.dispose();
  });

  describe('Memory Snapshots', () => {
    it('should take memory snapshots at regular intervals', () => {
      jest.advanceTimersByTime(60000); // 1 minute
      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots.length).toBeGreaterThan(0);
      expect(snapshots[0]).toHaveProperty('heapUsed');
      expect(snapshots[0]).toHaveProperty('timestamp');
    });

    it('should limit the number of snapshots', () => {
      // Advance time to accumulate many snapshots
      for (let i = 0; i < 200; i++) {
        jest.advanceTimersByTime(60000);
      }
      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(100); // Max snapshots
    });

    it('should record accurate memory values', () => {
      const heapUsed = 75 * 1024 * 1024; // 75MB
      mockMemoryUsage.mockReturnValue({
        heapUsed,
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 200 * 1024 * 1024,
      });

      jest.advanceTimersByTime(60000);
      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots[snapshots.length - 1].heapUsed).toBe(heapUsed);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect steady memory growth', () => {
      for (let i = 0; i < 5; i++) {
        mockMemoryUsage.mockReturnValue({
          heapUsed: (50 + i * 20) * 1024 * 1024, // Increasing memory usage
          heapTotal: 200 * 1024 * 1024,
          external: 0,
          arrayBuffers: 0,
          rss: 300 * 1024 * 1024,
        });
        jest.advanceTimersByTime(60000);
      }

      expect(mockLogger).toHaveBeenCalledWith(
        expect.stringContaining('memory growth'),
        expect.any(Object)
      );
    });

    it('should not report normal memory fluctuations', () => {
      for (let i = 0; i < 5; i++) {
        mockMemoryUsage.mockReturnValue({
          heapUsed: (50 + Math.sin(i) * 5) * 1024 * 1024, // Normal fluctuation
          heapTotal: 200 * 1024 * 1024,
          external: 0,
          arrayBuffers: 0,
          rss: 300 * 1024 * 1024,
        });
        jest.advanceTimersByTime(60000);
      }

      expect(mockLogger).not.toHaveBeenCalled();
    });
  });

  describe('High Memory Usage Alerts', () => {
    it('should alert on high memory usage', () => {
      mockMemoryUsage.mockReturnValue({
        heapUsed: 150 * 1024 * 1024, // 150MB
        heapTotal: 200 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 300 * 1024 * 1024,
      });

      jest.advanceTimersByTime(60000);
      expect(mockLogger).toHaveBeenCalledWith(
        expect.stringContaining('High memory usage'),
        expect.any(Object)
      );
    });

    it('should track memory usage over time', () => {
      const usageValues = [80, 90, 100, 95, 85].map(mb => mb * 1024 * 1024);
      
      usageValues.forEach(heapUsed => {
        mockMemoryUsage.mockReturnValue({
          heapUsed,
          heapTotal: 200 * 1024 * 1024,
          external: 0,
          arrayBuffers: 0,
          rss: 300 * 1024 * 1024,
        });
        jest.advanceTimersByTime(60000);
      });

      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots.map(s => s.heapUsed)).toEqual(usageValues);
    });
  });

  describe('Resource Management', () => {
    it('should clean up resources on dispose', () => {
      jest.advanceTimersByTime(60000);
      memoryMonitor.dispose();
      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots.length).toBe(0);
    });

    it('should handle rapid snapshot requests', () => {
      // Simulate rapid memory usage changes
      for (let i = 0; i < 100; i++) {
        mockMemoryUsage.mockReturnValue({
          heapUsed: 50 * 1024 * 1024,
          heapTotal: 100 * 1024 * 1024,
          external: 0,
          arrayBuffers: 0,
          rss: 200 * 1024 * 1024,
        });
        jest.advanceTimersByTime(1000); // 1 second intervals
      }

      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle memory usage errors', () => {
      mockMemoryUsage.mockImplementation(() => {
        throw new Error('Memory usage error');
      });

      jest.advanceTimersByTime(60000);
      expect(mockLogger).toHaveBeenCalled();
    });

    it('should continue monitoring after errors', () => {
      // First cause an error
      mockMemoryUsage.mockImplementationOnce(() => {
        throw new Error('Memory usage error');
      });

      jest.advanceTimersByTime(60000);

      // Then return to normal
      mockMemoryUsage.mockReturnValue({
        heapUsed: 50 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 200 * 1024 * 1024,
      });

      jest.advanceTimersByTime(60000);
      const snapshots = memoryMonitor.getSnapshots();
      expect(snapshots.length).toBeGreaterThan(0);
    });
  });

  describe('Analysis Features', () => {
    it('should calculate memory growth rate', () => {
      const growthRates: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        mockMemoryUsage.mockReturnValue({
          heapUsed: (50 + i * 10) * 1024 * 1024,
          heapTotal: 200 * 1024 * 1024,
          external: 0,
          arrayBuffers: 0,
          rss: 300 * 1024 * 1024,
        });
        jest.advanceTimersByTime(60000);
        
        const snapshots = memoryMonitor.getSnapshots();
        if (snapshots.length >= 2) {
          const latest = snapshots[snapshots.length - 1];
          const previous = snapshots[snapshots.length - 2];
          const growthRate = (latest.heapUsed - previous.heapUsed) / previous.heapUsed;
          growthRates.push(growthRate);
        }
      }

      expect(growthRates.length).toBeGreaterThan(0);
      expect(Math.max(...growthRates)).toBeGreaterThan(0);
    });

    it('should identify memory usage patterns', () => {
      // Simulate a sawtooth pattern
      for (let i = 0; i < 10; i++) {
        mockMemoryUsage.mockReturnValue({
          heapUsed: (50 + (i % 2) * 20) * 1024 * 1024, // Alternating between 50MB and 70MB
          heapTotal: 100 * 1024 * 1024,
          external: 0,
          arrayBuffers: 0,
          rss: 200 * 1024 * 1024,
        });
        jest.advanceTimersByTime(60000);
      }

      const snapshots = memoryMonitor.getSnapshots();
      const usages = snapshots.map(s => s.heapUsed);
      
      // Check for alternating pattern
      for (let i = 2; i < usages.length; i++) {
        expect(usages[i]).toBe(usages[i - 2]);
      }
    });
  });
}); 