import { jest, describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { memoryMonitor, performanceMonitor, ErrorBoundary } from '../index';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('MemoryMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    memoryMonitor.dispose();
  });

  it('should take memory snapshots', () => {
    jest.advanceTimersByTime(60000);
    const snapshots = memoryMonitor.getSnapshots();
    expect(snapshots.length).toBeGreaterThan(0);
  });

  it('should detect high memory usage', () => {
    const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 200 * 1024 * 1024,
      heapTotal: 300 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
      rss: 500 * 1024 * 1024,
    });

    jest.advanceTimersByTime(60000);
    expect(mockLogger).toHaveBeenCalled();
    mockLogger.mockRestore();
  });

  it('should detect memory leaks', () => {
    const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});

    for (let i = 0; i < 5; i++) {
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: (50 + i * 20) * 1024 * 1024,
        heapTotal: 300 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 500 * 1024 * 1024,
      });
      jest.advanceTimersByTime(60000);
    }

    expect(mockLogger).toHaveBeenCalled();
    mockLogger.mockRestore();
  });
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
  });

  it('should track operation duration', () => {
    performanceMonitor.startOperation('test', 'computation');
    jest.advanceTimersByTime(150);
    performanceMonitor.endOperation('test', 'computation');

    const metrics = performanceMonitor.getMetrics('computation');
    expect(metrics[0].duration).toBeGreaterThan(100);
  });

  it('should detect slow operations', () => {
    const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});

    performanceMonitor.startOperation('slow-op', 'network');
    jest.advanceTimersByTime(2000);
    performanceMonitor.endOperation('slow-op', 'network');

    expect(mockLogger).toHaveBeenCalled();
    mockLogger.mockRestore();
  });

  it('should handle multiple concurrent operations', () => {
    performanceMonitor.startOperation('op1', 'computation');
    performanceMonitor.startOperation('op2', 'network');
    jest.advanceTimersByTime(100);
    performanceMonitor.endOperation('op1', 'computation');
    jest.advanceTimersByTime(100);
    performanceMonitor.endOperation('op2', 'network');

    const metrics = performanceMonitor.getMetrics();
    expect(metrics.length).toBe(2);
  });

  it('should respect custom thresholds', () => {
    const mockLogger = jest.spyOn(console, 'warn').mockImplementation(() => {});

    performanceMonitor.setThreshold('render', 50);
    performanceMonitor.startOperation('render', 'render');
    jest.advanceTimersByTime(100);
    performanceMonitor.endOperation('render', 'render');

    expect(mockLogger).toHaveBeenCalled();
    mockLogger.mockRestore();
  });
}); 