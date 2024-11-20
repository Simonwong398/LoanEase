import { PanResponder, PanResponderGestureState, GestureResponderEvent } from 'react-native';

interface SwipeConfig {
  minDistance: number;
  maxDuration: number;
  direction: 'horizontal' | 'vertical' | 'both';
}

interface GestureConfig {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeConfig?: Partial<SwipeConfig>;
}

export class GestureHandler {
  private lastTap: number = 0;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly LONG_PRESS_DELAY = 500;

  constructor(private config: GestureConfig) {}

  createPanResponder() {
    const swipeConfig: SwipeConfig = {
      minDistance: 50,
      maxDuration: 250,
      direction: 'both',
      ...this.config.swipeConfig,
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e: GestureResponderEvent) => {
        const now = Date.now();
        if (now - this.lastTap < this.DOUBLE_TAP_DELAY) {
          this.config.onDoubleTap?.();
        }
        this.lastTap = now;

        if (this.config.onLongPress) {
          this.longPressTimeout = setTimeout(
            this.config.onLongPress,
            this.LONG_PRESS_DELAY
          );
        }
      },

      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }

        if (this.config.onSwipe) {
          const { dx, dy, vx, vy } = gestureState;
          const duration = gestureState.moveX ? Math.abs(dx / vx) : 0;

          if (duration <= swipeConfig.maxDuration) {
            if (swipeConfig.direction !== 'vertical' && 
                Math.abs(dx) >= swipeConfig.minDistance) {
              this.config.onSwipe(dx > 0 ? 'right' : 'left');
            } else if (swipeConfig.direction !== 'horizontal' && 
                      Math.abs(dy) >= swipeConfig.minDistance) {
              this.config.onSwipe(dy > 0 ? 'down' : 'up');
            }
          }
        }
      },

      onPanResponderTerminate: () => {
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }
      },
    });
  }

  private longPressTimeout: NodeJS.Timeout | null = null;
} 