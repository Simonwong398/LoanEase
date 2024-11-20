import { networkManager } from '../index';
import { performance } from 'perf_hooks';
import { jest } from '@jest/globals';

interface TestResponse {
  id?: number;
  data?: string;
  success?: boolean;
  count?: number;
}

// 定义 fetch 函数的类型
type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

describe('NetworkManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    networkManager.clearCache();
  });

  it('should make successful request', async () => {
    const mockResponse: TestResponse = { data: 'test' };
    const mockFetch = jest.fn(async () => {
      return new Response(JSON.stringify(mockResponse));
    }) as jest.MockedFunction<FetchFunction>;
    
    global.fetch = mockFetch;

    const result = await networkManager.request<TestResponse>('https://api.test.com');
    expect(result).toEqual(mockResponse);
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockResponse: TestResponse = { data: 'test' };
      const mockFetch = jest.fn(async () => {
        return new Response(JSON.stringify(mockResponse));
      }) as jest.MockedFunction<FetchFunction>;
      
      global.fetch = mockFetch;

      const startTime = performance.now();
      const requests = Array(100).fill(null).map((_, index) => 
        networkManager.request<TestResponse>(`https://api.test.com/${index}`)
      );

      await Promise.all(requests);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5000);
      expect(mockFetch).toHaveBeenCalledTimes(100);
    });

    it('should handle large payloads efficiently', async () => {
      const largePayload: TestResponse[] = Array(1000).fill({ data: 'test' });
      const mockFetch = jest.fn(async () => {
        return new Response(JSON.stringify(largePayload));
      }) as jest.MockedFunction<FetchFunction>;
      
      global.fetch = mockFetch;

      const startTime = performance.now();
      await networkManager.request<TestResponse[]>('https://api.test.com/large');
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle race conditions correctly', async () => {
      const mockResponse: TestResponse = { data: 'test' };
      let requestCount = 0;
      
      const mockFetch = jest.fn(async () => {
        requestCount++;
        return new Response(JSON.stringify({
          ...mockResponse,
          count: requestCount
        }));
      }) as jest.MockedFunction<FetchFunction>;
      
      global.fetch = mockFetch;

      const results = await Promise.all([
        networkManager.request<TestResponse>('https://api.test.com/1', { cacheKey: 'test' }),
        networkManager.request<TestResponse>('https://api.test.com/1', { cacheKey: 'test' }),
      ]);

      expect(results[0]).toEqual(results[1]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry failed requests', async () => {
      let attempts = 0;
      const mockFetch = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Network error');
        }
        return new Response(JSON.stringify({ success: true }));
      }) as jest.MockedFunction<FetchFunction>;
      
      global.fetch = mockFetch;

      const result = await networkManager.request('https://api.test.com', {
        retries: 3
      });

      expect(result).toEqual({ success: true });
      expect(attempts).toBe(3);
    });

    it('should handle timeout correctly', async () => {
      const mockFetch = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return new Response();
      }) as jest.MockedFunction<FetchFunction>;
      
      global.fetch = mockFetch;

      await expect(
        networkManager.request('https://api.test.com', { timeout: 1000 })
      ).rejects.toThrow('Request timeout');
    });
  });
}); 