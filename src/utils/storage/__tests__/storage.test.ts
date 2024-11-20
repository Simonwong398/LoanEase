import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { storageManager } from '../index';
import { performanceManager } from '../../performance';
import { cacheManager } from '../../cache';

describe('StorageManager', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await storageManager.clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve data', async () => {
      const testData = { name: 'test', value: 123 };
      await storageManager.setItem('test-key', testData);
      const retrieved = await storageManager.getItem('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should remove data', async () => {
      await storageManager.setItem('test-key', 'test-value');
      await storageManager.removeItem('test-key');
      const retrieved = await storageManager.getItem('test-key');
      expect(retrieved).toBeNull();
    });

    it('should clear all data', async () => {
      await storageManager.setItem('key1', 'value1');
      await storageManager.setItem('key2', 'value2');
      await storageManager.clear();
      expect(await storageManager.getItem('key1')).toBeNull();
      expect(await storageManager.getItem('key2')).toBeNull();
    });
  });

  describe('Storage Types', () => {
    it('should handle local storage', async () => {
      await storageManager.setItem('local-key', 'local-value', { type: 'local' });
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const retrieved = await storageManager.getItem('local-key', { type: 'local' });
      expect(retrieved).toBe('local-value');
    });

    it('should handle session storage', async () => {
      const sessionStorageMock = {
        ...localStorageMock,
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

      await storageManager.setItem('session-key', 'session-value', { type: 'session' });
      expect(sessionStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle memory storage', async () => {
      const testData = { test: 'memory' };
      await storageManager.setItem('memory-key', testData, { type: 'memory' });
      const retrieved = await storageManager.getItem('memory-key', { type: 'memory' });
      expect(retrieved).toEqual(testData);
    });

    it('should handle cloud storage', async () => {
      // Mock cloud storage operations
      const cloudData = { test: 'cloud' };
      jest.spyOn(storageManager as any, 'setCloudItem').mockResolvedValue(undefined);
      jest.spyOn(storageManager as any, 'getCloudItem').mockResolvedValue(JSON.stringify(cloudData));

      await storageManager.setItem('cloud-key', cloudData, { type: 'cloud' });
      const retrieved = await storageManager.getItem('cloud-key', { type: 'cloud' });
      expect(retrieved).toEqual(cloudData);
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data', async () => {
      const sensitiveData = { password: '123456' };
      await storageManager.setItem('sensitive-key', sensitiveData, { encrypt: true });
      const retrieved = await storageManager.getItem('sensitive-key');
      expect(retrieved).toEqual(sensitiveData);
    });

    it('should handle encryption errors', async () => {
      jest.spyOn(storageManager as any, 'encryptData').mockRejectedValue(new Error('Encryption failed'));
      await expect(
        storageManager.setItem('error-key', 'test', { encrypt: true })
      ).rejects.toThrow('Encryption failed');
    });
  });

  describe('Data Compression', () => {
    it('should compress and decompress data', async () => {
      const largeData = { data: 'x'.repeat(1000) };
      await storageManager.setItem('large-key', largeData, { compress: true });
      const retrieved = await storageManager.getItem('large-key');
      expect(retrieved).toEqual(largeData);
    });

    it('should handle compression errors', async () => {
      jest.spyOn(storageManager as any, 'compressData').mockRejectedValue(new Error('Compression failed'));
      await expect(
        storageManager.setItem('error-key', 'test', { compress: true })
      ).rejects.toThrow('Compression failed');
    });
  });

  describe('Cache Integration', () => {
    it('should use cache for frequently accessed data', async () => {
      const testData = { cached: true };
      await storageManager.setItem('cache-key', testData, { useCache: true });
      
      // First retrieval should set cache
      await storageManager.getItem('cache-key');
      
      // Second retrieval should use cache
      const getCacheSpy = jest.spyOn(cacheManager, 'get');
      await storageManager.getItem('cache-key');
      expect(getCacheSpy).toHaveBeenCalled();
    });

    it('should respect cache TTL', async () => {
      const testData = { cached: true };
      await storageManager.setItem('ttl-key', testData, {
        useCache: true,
        cacheTTL: 1000
      });

      // Fast-forward time
      jest.advanceTimersByTime(2000);

      // Cache should be expired
      const retrieved = await storageManager.getItem('ttl-key');
      expect(retrieved).toEqual(testData);
    });
  });

  describe('Performance Monitoring', () => {
    it('should record performance metrics for operations', async () => {
      const recordMetricSpy = jest.spyOn(performanceManager, 'recordMetric');
      
      await storageManager.setItem('perf-key', 'test');
      expect(recordMetricSpy).toHaveBeenCalledWith(
        'storage',
        'set',
        expect.any(Number),
        expect.any(Object)
      );
    });

    it('should record errors in performance metrics', async () => {
      const recordMetricSpy = jest.spyOn(performanceManager, 'recordMetric');
      jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      try {
        await storageManager.setItem('error-key', 'test');
      } catch {
        // Ignore error
      }

      expect(recordMetricSpy).toHaveBeenCalledWith(
        'storage',
        'set',
        expect.any(Number),
        expect.objectContaining({ success: false })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle storage quota exceeded', async () => {
      jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      await expect(
        storageManager.setItem('quota-key', 'test')
      ).rejects.toThrow('QuotaExceededError');
    });

    it('should handle invalid JSON', async () => {
      jest.spyOn(localStorageMock, 'getItem').mockReturnValue('invalid json');
      
      await expect(
        storageManager.getItem('invalid-key')
      ).rejects.toThrow();
    });

    it('should handle missing keys', async () => {
      const result = await storageManager.getItem('non-existent-key');
      expect(result).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should handle multiple operations in sequence', async () => {
      const operations = [
        storageManager.setItem('key1', 'value1'),
        storageManager.setItem('key2', 'value2'),
        storageManager.setItem('key3', 'value3')
      ];

      await Promise.all(operations);

      const results = await Promise.all([
        storageManager.getItem('key1'),
        storageManager.getItem('key2'),
        storageManager.getItem('key3')
      ]);

      expect(results).toEqual(['value1', 'value2', 'value3']);
    });

    it('should handle batch failures gracefully', async () => {
      jest.spyOn(localStorageMock, 'setItem')
        .mockImplementationOnce(() => {}) // First call succeeds
        .mockImplementationOnce(() => { throw new Error('Failed'); }); // Second call fails

      const operations = [
        storageManager.setItem('success-key', 'value1'),
        storageManager.setItem('error-key', 'value2')
      ];

      await expect(Promise.all(operations)).rejects.toThrow('Failed');
      expect(await storageManager.getItem('success-key')).toBe('value1');
    });
  });

  describe('Cloud Sync', () => {
    it('should sync data with cloud storage', async () => {
      const syncSpy = jest.spyOn(storageManager as any, 'syncToCloud');
      
      await storageManager.setItem('sync-key', 'test', { syncToCloud: true });
      expect(syncSpy).toHaveBeenCalled();
    });

    it('should handle sync failures', async () => {
      jest.spyOn(storageManager as any, 'syncToCloud')
        .mockRejectedValue(new Error('Sync failed'));

      await storageManager.setItem('sync-key', 'test', { syncToCloud: true });
      // Should not throw error, but log it
      expect(console.error).toHaveBeenCalled();
    });

    it('should retry failed sync operations', async () => {
      const syncSpy = jest.spyOn(storageManager as any, 'syncToCloud')
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(undefined);

      await storageManager.setItem('retry-key', 'test', { syncToCloud: true });
      expect(syncSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should clean up resources on dispose', async () => {
      const clearCacheSpy = jest.spyOn(cacheManager, 'clear');
      
      await storageManager.dispose();
      expect(clearCacheSpy).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      jest.spyOn(cacheManager, 'clear').mockRejectedValue(new Error('Cleanup failed'));
      
      await storageManager.dispose();
      // Should not throw error, but log it
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 