import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

declare global {
  const describe: typeof jest.describe;
  const it: typeof jest.it;
  const expect: typeof jest.expect;
  const beforeEach: typeof jest.beforeEach;
  const afterEach: typeof jest.afterEach;
} 