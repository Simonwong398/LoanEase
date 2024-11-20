import React from 'react';
import {
  View,
  PanResponder,
  PanResponderGestureState,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  swipeThreshold?: number;
}

interface GestureHandlerProps extends GestureConfig {
  children: React.ReactNode;
  style?: ViewStyle;
  enabled?: boolean;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  style,
  enabled = true,
  swipeThreshold = 50,
  ...gestureConfig
}) => {
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderMove: (
          _: GestureResponderEvent,
          gestureState: PanResponderGestureState
        ) => {
          const { dx, dy } = gestureState;

          if (Math.abs(dx) > swipeThreshold) {
            if (dx > 0 && gestureConfig.onSwipeRight) {
              gestureConfig.onSwipeRight();
            } else if (dx < 0 && gestureConfig.onSwipeLeft) {
              gestureConfig.onSwipeLeft();
            }
          }

          if (Math.abs(dy) > swipeThreshold) {
            if (dy > 0 && gestureConfig.onSwipeDown) {
              gestureConfig.onSwipeDown();
            } else if (dy < 0 && gestureConfig.onSwipeUp) {
              gestureConfig.onSwipeUp();
            }
          }
        },
      }),
    [enabled, swipeThreshold, gestureConfig]
  );

  return (
    <View style={style} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default GestureHandler; 