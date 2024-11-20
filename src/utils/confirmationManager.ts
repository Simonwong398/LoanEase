interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

class ConfirmationManager {
  private static instance: ConfirmationManager;
  private subscribers: Set<(options: ConfirmationOptions | null) => void> = new Set();
  private currentOptions: ConfirmationOptions | null = null;

  private constructor() {}

  static getInstance(): ConfirmationManager {
    if (!ConfirmationManager.instance) {
      ConfirmationManager.instance = new ConfirmationManager();
    }
    return ConfirmationManager.instance;
  }

  show(options: ConfirmationOptions): void {
    this.currentOptions = options;
    this.notifySubscribers();
  }

  hide(): void {
    this.currentOptions = null;
    this.notifySubscribers();
  }

  subscribe(callback: (options: ConfirmationOptions | null) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentOptions));
  }
}

export const confirmationManager = ConfirmationManager.getInstance(); 