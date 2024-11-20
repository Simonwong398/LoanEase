interface GuideStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  order: number;
  skippable?: boolean;
  action?: 'click' | 'input' | 'scroll' | 'swipe';
}

interface GuideFlow {
  id: string;
  name: string;
  steps: GuideStep[];
  completed?: boolean;
  lastShown?: number;
}

class UserGuideManager {
  private static instance: UserGuideManager;
  private guides: Map<string, GuideFlow> = new Map();
  private subscribers: Set<(guide: GuideFlow | null) => void> = new Set();
  private currentGuide: GuideFlow | null = null;
  private currentStep: number = 0;

  private constructor() {
    this.loadGuides();
  }

  static getInstance(): UserGuideManager {
    if (!UserGuideManager.instance) {
      UserGuideManager.instance = new UserGuideManager();
    }
    return UserGuideManager.instance;
  }

  private async loadGuides(): Promise<void> {
    // 从存储加载引导配置
  }

  startGuide(guideId: string): void {
    const guide = this.guides.get(guideId);
    if (guide && !guide.completed) {
      this.currentGuide = guide;
      this.currentStep = 0;
      this.notifySubscribers();
    }
  }

  nextStep(): void {
    if (this.currentGuide && this.currentStep < this.currentGuide.steps.length - 1) {
      this.currentStep++;
      this.notifySubscribers();
    } else {
      this.completeGuide();
    }
  }

  previousStep(): void {
    if (this.currentGuide && this.currentStep > 0) {
      this.currentStep--;
      this.notifySubscribers();
    }
  }

  skipGuide(): void {
    if (this.currentGuide) {
      this.completeGuide();
    }
  }

  private completeGuide(): void {
    if (this.currentGuide) {
      this.currentGuide.completed = true;
      this.currentGuide.lastShown = Date.now();
      this.currentGuide = null;
      this.currentStep = 0;
      this.notifySubscribers();
    }
  }

  subscribe(callback: (guide: GuideFlow | null) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentGuide));
  }

  getCurrentStep(): GuideStep | null {
    if (!this.currentGuide) return null;
    return this.currentGuide.steps[this.currentStep];
  }

  isGuideCompleted(guideId: string): boolean {
    return this.guides.get(guideId)?.completed ?? false;
  }

  resetGuide(guideId: string): void {
    const guide = this.guides.get(guideId);
    if (guide) {
      guide.completed = false;
      guide.lastShown = undefined;
    }
  }
}

export const userGuideManager = UserGuideManager.getInstance(); 