interface CalculationProgress {
  totalItems: number;
  completedItems: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  stage: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

type ProgressCallback = (progress: CalculationProgress) => void;

class CalculationProgressManager {
  private static instance: CalculationProgressManager;
  private callbacks: Set<ProgressCallback> = new Set();
  private currentProgress: CalculationProgress | null = null;
  private startTime: number = 0;

  private constructor() {}

  static getInstance(): CalculationProgressManager {
    if (!CalculationProgressManager.instance) {
      CalculationProgressManager.instance = new CalculationProgressManager();
    }
    return CalculationProgressManager.instance;
  }

  subscribe(callback: ProgressCallback): () => void {
    this.callbacks.add(callback);
    if (this.currentProgress) {
      callback(this.currentProgress);
    }
    return () => this.callbacks.delete(callback);
  }

  startCalculation(totalItems: number, batchSize: number): void {
    this.startTime = Date.now();
    this.currentProgress = {
      totalItems,
      completedItems: 0,
      currentBatch: 0,
      totalBatches: Math.ceil(totalItems / batchSize),
      estimatedTimeRemaining: 0,
      stage: 'initialization',
      status: 'processing',
    };
    this.notifySubscribers();
  }

  updateProgress(completedItems: number, stage: string): void {
    if (!this.currentProgress) return;

    const elapsedTime = Date.now() - this.startTime;
    const itemsPerMs = completedItems / elapsedTime;
    const remainingItems = this.currentProgress.totalItems - completedItems;
    const estimatedTimeRemaining = remainingItems / itemsPerMs;

    this.currentProgress = {
      ...this.currentProgress,
      completedItems,
      estimatedTimeRemaining,
      stage,
      currentBatch: Math.floor(completedItems / (this.currentProgress.totalItems / this.currentProgress.totalBatches)),
    };

    this.notifySubscribers();
  }

  completeCalculation(): void {
    if (this.currentProgress) {
      this.currentProgress.status = 'completed';
      this.currentProgress.completedItems = this.currentProgress.totalItems;
      this.currentProgress.estimatedTimeRemaining = 0;
      this.notifySubscribers();
    }
  }

  setError(error: string): void {
    if (this.currentProgress) {
      this.currentProgress.status = 'error';
      this.notifySubscribers();
    }
  }

  private notifySubscribers(): void {
    if (this.currentProgress) {
      this.callbacks.forEach(callback => callback(this.currentProgress!));
    }
  }

  reset(): void {
    this.currentProgress = null;
    this.startTime = 0;
  }
}

export const calculationProgressManager = CalculationProgressManager.getInstance(); 