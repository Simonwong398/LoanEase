import { Animated, Easing } from 'react-native';

export interface AnimationConfig {
  duration?: number;
  easing?: (value: number) => number;
  delay?: number;
  useNativeDriver?: boolean;
}

const defaultEasing = Easing.bezier(0.4, 0, 0.2, 1);

export class AnimationPresets {
  // 淡入淡出
  static fade(value: Animated.Value, config?: AnimationConfig) {
    return {
      fadeIn: Animated.timing(value, {
        toValue: 1,
        duration: config?.duration || 300,
        easing: config?.easing || defaultEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
      fadeOut: Animated.timing(value, {
        toValue: 0,
        duration: config?.duration || 300,
        easing: config?.easing || defaultEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
    };
  }

  // 滑动
  static slide(value: Animated.Value, config?: AnimationConfig & { distance?: number }) {
    const distance = config?.distance || 100;
    return {
      slideIn: Animated.timing(value, {
        toValue: 0,
        duration: config?.duration || 300,
        easing: config?.easing || defaultEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
      slideOut: Animated.timing(value, {
        toValue: distance,
        duration: config?.duration || 300,
        easing: config?.easing || defaultEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
    };
  }

  // 缩放
  static scale(value: Animated.Value, config?: AnimationConfig) {
    const elasticEasing = Easing.bezier(0.68, -0.55, 0.265, 1.55);
    return {
      scaleIn: Animated.timing(value, {
        toValue: 1,
        duration: config?.duration || 300,
        easing: config?.easing || elasticEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
      scaleOut: Animated.timing(value, {
        toValue: 0,
        duration: config?.duration || 300,
        easing: config?.easing || elasticEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
    };
  }

  // 弹跳
  static bounce(value: Animated.Value, config?: AnimationConfig) {
    return Animated.spring(value, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: config?.useNativeDriver ?? true,
    });
  }

  // 旋转
  static rotate(value: Animated.Value, config?: AnimationConfig) {
    return {
      rotateIn: Animated.timing(value, {
        toValue: 1,
        duration: config?.duration || 300,
        easing: config?.easing || defaultEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
      rotateOut: Animated.timing(value, {
        toValue: 0,
        duration: config?.duration || 300,
        easing: config?.easing || defaultEasing,
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver ?? true,
      }),
    };
  }

  // 序列动画
  static sequence(animations: Animated.CompositeAnimation[]) {
    return Animated.sequence(animations);
  }

  // 并行动画
  static parallel(animations: Animated.CompositeAnimation[]) {
    return Animated.parallel(animations);
  }

  // 交错动画
  static stagger(duration: number, animations: Animated.CompositeAnimation[]) {
    return Animated.stagger(duration, animations);
  }

  // 循环动画
  static loop(animation: Animated.CompositeAnimation, config?: { iterations?: number }) {
    return Animated.loop(animation, {
      iterations: config?.iterations,
    });
  }

  // 自定义动画曲线
  static customTiming(value: Animated.Value, config: AnimationConfig & { toValue: number }) {
    return Animated.timing(value, {
      toValue: config.toValue,
      duration: config.duration || 300,
      easing: config.easing || defaultEasing,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver ?? true,
    });
  }
}

// 动画Hook
export const useAnimation = (initialValue: number = 0) => {
  const animatedValue = new Animated.Value(initialValue);
  
  return {
    value: animatedValue,
    fade: (config?: AnimationConfig) => AnimationPresets.fade(animatedValue, config),
    slide: (config?: AnimationConfig & { distance?: number }) => 
      AnimationPresets.slide(animatedValue, config),
    scale: (config?: AnimationConfig) => AnimationPresets.scale(animatedValue, config),
    bounce: (config?: AnimationConfig) => AnimationPresets.bounce(animatedValue, config),
    rotate: (config?: AnimationConfig) => AnimationPresets.rotate(animatedValue, config),
    custom: (config: AnimationConfig & { toValue: number }) => 
      AnimationPresets.customTiming(animatedValue, config),
  };
}; 