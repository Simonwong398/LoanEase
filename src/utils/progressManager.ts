type ProgressCallback = (progress: number, message?: string) => void;

class ProgressManager {
  private static instance: ProgressManager;
  private callbacks: Set<ProgressCallback> = new Set();
  private currentProgress: number = 0;
  private currentMessage: string = '';

  private constructor() {}

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  subscribe(callback: ProgressCallback) {
    this.callbacks.add(callback);
    // 立即发送当前进度
    callback(this.currentProgress, this.currentMessage);
    return () => this.callbacks.delete(callback);
  }

  updateProgress(progress: number, message?: string) {
    this.currentProgress = progress;
    if (message) this.currentMessage = message;
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.callbacks.forEach(callback => 
      callback(this.currentProgress, this.currentMessage)
    );
  }

  reset() {
    this.currentProgress = 0;
    this.currentMessage = '';
    this.notifySubscribers();
  }
}

export const progressManager = ProgressManager.getInstance(); 