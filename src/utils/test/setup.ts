import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import type { Storage } from '../../types/storage';
import { jest } from '@jest/globals';

// 扩展全局类型
declare global {
  // 扩展 Window 接口
  interface Window {
    localStorage: Storage;
  }
  // 扩展 NodeJS.Global 接口
  namespace NodeJS {
    interface Global {
      localStorage: Storage;
      fetch: jest.Mock;
    }
  }
}

// 每个测试后清理
afterEach(cleanup);

// 模拟 localStorage
const localStorageMock: Storage = {
  length: 0,
  key: (index: number): string | null => null,
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// 设置全局 localStorage
global.localStorage = localStorageMock;

// 模拟 fetch
const mockFetch = jest.fn(() => Promise.resolve(new Response()));
global.fetch = mockFetch;