interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'default' | 'progress' | 'spinner';
}

class LoadingStateManager {
  private static instance: LoadingStateManager;
  private subscribers: Set<(state: LoadingState) => void> = new Set();
  private currentState: LoadingState = {
    isLoading: false,
    type: 'default'
  };

  private constructor() {}

  static getInstance(): LoadingStateManager {
    if (!LoadingStateManager.instance) {
      LoadingStateManager.instance = new LoadingStateManager();
    }
    return LoadingStateManager.instance;
  }

  show(options: Partial<LoadingState> = {}): void {
    this.currentState = {
      ...this.currentState,
      ...options,
      isLoading: true,
    };
    this.notifySubscribers();
  }

  hide(): void {
    this.currentState = {
      isLoading: false,
      type: 'default'
    };
    this.notifySubscribers();
  }

  updateProgress(progress: number, message?: string): void {
    this.currentState = {
      ...this.currentState,
      progress,
      message,
      type: 'progress'
    };
    this.notifySubscribers();
  }

  subscribe(callback: (state: LoadingState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentState));
  }
}

export const loadingStateManager = LoadingStateManager.getInstance(); 