"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const react_1 = require("@testing-library/react");
const globals_1 = require("@jest/globals");
// 每个测试后清理
afterEach(react_1.cleanup);
// 模拟 localStorage
const localStorageMock = {
    length: 0,
    key: (index) => null,
    getItem: globals_1.jest.fn(() => null),
    setItem: globals_1.jest.fn(),
    removeItem: globals_1.jest.fn(),
    clear: globals_1.jest.fn(),
};
// 设置全局 localStorage
global.localStorage = localStorageMock;
// 模拟 fetch
const mockFetch = globals_1.jest.fn(() => Promise.resolve(new Response()));
global.fetch = mockFetch;
