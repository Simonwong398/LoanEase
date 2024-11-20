import { performance } from 'perf_hooks';
import { logger } from '../src/utils/logger';

interface PerformanceMetrics {
    endpoint: string;
    method: string;
    responseTime: number;
    timestamp: Date;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];

    start(endpoint: string, method: string): () => void {
        const startTime = performance.now();
        
        return () => {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            this.metrics.push({
                endpoint,
                method,
                responseTime,
                timestamp: new Date()
            });
            
            if (responseTime > 1000) {
                logger.warn(
                    'Slow API response detected',
                    'PerformanceMonitor',
                    {
                        endpoint,
                        method,
                        responseTime
                    }
                );
            }
        };
    }

    getMetrics(): PerformanceMetrics[] {
        return this.metrics;
    }

    clearMetrics(): void {
        this.metrics = [];
    }
}

export const performanceMonitor = new PerformanceMonitor(); 