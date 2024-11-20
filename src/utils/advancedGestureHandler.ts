import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface GestureConfig {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  onPan?: (dx: number, dy: number) => void;
  swipeConfig?: {
    minDistance?: number;
    maxDuration?: number;
    direction?: 'horizontal' | 'vertical' | 'both';
  };
}

export class AdvancedGestureHandler {
  private lastTap: number = 0;
  private initialRotation: number = 0;
  private initialScale: number = 1;
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly LONG_PRESS_DELAY = 500;
  private longPressTimeout: NodeJS.Timeout | null = null;

  constructor(private config: GestureConfig) {}

  createPanResponder() {
    const swipeConfig = {
      minDistance: 50,
      maxDuration: 250,
      direction: 'both',
      ...this.config.swipeConfig,
    };

    let initialTouches: GestureResponderEvent['nativeEvent']['touches'] = [];
    let lastRotation = 0;
    let lastScale = 1;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e: GestureResponderEvent) => {
        initialTouches = e.nativeEvent.touches;
        const now = Date.now();

        // 处理双击
        if (now - this.lastTap < this.DOUBLE_TAP_DELAY) {
          this.config.onDoubleTap?.();
        }
        this.lastTap = now;

        // 处理长按
        if (this.config.onLongPress) {
          this.longPressTimeout = setTimeout(
            this.config.onLongPress,
            this.LONG_PRESS_DELAY
          );
        }
      },

      onPanResponderMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const touches = e.nativeEvent.touches;

        // 处理拖动
        if (this.config.onPan) {
          this.config.onPan(gestureState.dx, gestureState.dy);
        }

        // 处理双指手势
        if (touches.length === 2 && initialTouches.length === 2) {
          // 计算缩放
          const currentDistance = this.getDistance(touches);
          const initialDistance = this.getDistance(initialTouches);
          const scale = currentDistance / initialDistance;
          
          if (this.config.onPinch && Math.abs(scale - lastScale) > 0.05) {
            this.config.onPinch(scale);
            lastScale = scale;
          }

          // 计算旋转
          const currentRotation = this.getRotation(touches);
          const initialRotation = this.getRotation(initialTouches);
          const rotation = currentRotation - initialRotation;
          
          if (this.config.onRotate && Math.abs(rotation - lastRotation) > 5) {
            this.config.onRotate(rotation);
            lastRotation = rotation;
          }
        }
      },

      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }

        // 处理滑动
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

  private getDistance(touches: any[]): number {
    if (touches.length < 2) return 0;
    const dx = touches[1].pageX - touches[0].pageX;
    const dy = touches[1].pageY - touches[0].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getRotation(touches: any[]): number {
    if (touches.length < 2) return 0;
    const dx = touches[1].pageX - touches[0].pageX;
    const dy = touches[1].pageY - touches[0].pageY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }
} 