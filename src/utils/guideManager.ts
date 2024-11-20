import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
  skippable?: boolean;
}

export interface GuideFlow {
  id: string;
  name: string;
  steps: GuideStep[];
  completed?: boolean;
  lastShown?: number;
}

class GuideManager {
  private static instance: GuideManager;
  private guides: Map<string, GuideFlow> = new Map();
  private currentGuide: GuideFlow | null = null;
  private currentStep = 0;
  private subscribers: Set<(guide: GuideFlow | null, step: number) => void> = new Set();

  private constructor() {
    this.loadGuides();
  }

  static getInstance(): GuideManager {
    if (!GuideManager.instance) {
      GuideManager.instance = new GuideManager();
    }
    return GuideManager.instance;
  }

  private async loadGuides(): Promise<void> {
    try {
      const savedGuides = await AsyncStorage.getItem('@guides');
      if (savedGuides) {
        const guides = JSON.parse(savedGuides);
        guides.forEach((guide: GuideFlow) => {
          this.guides.set(guide.id, guide);
        });
      }
    } catch (error) {
      console.error('Failed to load guides:', error);
    }
  }

  private async saveGuides(): Promise<void> {
    try {
      const guides = Array.from(this.guides.values());
      await AsyncStorage.setItem('@guides', JSON.stringify(guides));
    } catch (error) {
      console.error('Failed to save guides:', error);
    }
  }

  subscribe(callback: (guide: GuideFlow | null, step: number) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentGuide, this.currentStep));
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

  private async completeGuide(): Promise<void> {
    if (this.currentGuide) {
      this.currentGuide.completed = true;
      this.currentGuide.lastShown = Date.now();
      await this.saveGuides();
      this.currentGuide = null;
      this.currentStep = 0;
      this.notifySubscribers();
    }
  }

  resetGuide(guideId: string): void {
    const guide = this.guides.get(guideId);
    if (guide) {
      guide.completed = false;
      guide.lastShown = undefined;
      this.saveGuides();
    }
  }

  getCurrentStep(): GuideStep | null {
    if (!this.currentGuide) return null;
    return this.currentGuide.steps[this.currentStep];
  }

  isGuideCompleted(guideId: string): boolean {
    return this.guides.get(guideId)?.completed ?? false;
  }
}

export const guideManager = GuideManager.getInstance(); 