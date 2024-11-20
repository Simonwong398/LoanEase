import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { useAppSettings } from '../hooks/useAppSettings';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'tap' | 'swipe' | 'pinch' | 'rotate';
  importance?: 'low' | 'medium' | 'high';
  skippable?: boolean;
}

interface AdvancedUserGuideProps {
  steps: GuideStep[];
  onComplete: () => void;
  visible: boolean;
  onSkip?: () => void;
}

const AdvancedUserGuide: React.FC<AdvancedUserGuideProps> = ({
  steps,
  onComplete,
  visible,
  onSkip,
}) => {
  const { t } = useLanguage();
  const { settings } = useAppSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetMeasurements, setTargetMeasurements] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // 启动脉冲动画
      startPulseAnimation();
    }
  }, [visible, currentStep]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const measureTarget = () => {
    const targetId = steps[currentStep].target;
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetMeasurements(rect);
    }
  };

  useEffect(() => {
    measureTarget();
  }, [currentStep]);

  const handleNext = () => {
    // 淡出当前步骤
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete();
      }
    });
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const renderActionIcon = (action?: string) => {
    // 根据不同的操作类型渲染不同的图标
    switch (action) {
      case 'tap':
        return '👆';
      case 'swipe':
        return '👈';
      case 'pinch':
        return '🤏';
      case 'rotate':
        return '🔄';
      default:
        return null;
    }
  };

  const renderHighlight = () => {
    if (!targetMeasurements) return null;

    return (
      <Animated.View
        style={[
          styles.highlight,
          {
            top: targetMeasurements.top,
            left: targetMeasurements.left,
            width: targetMeasurements.width,
            height: targetMeasurements.height,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
    );
  };

  const renderTooltip = () => {
    const step = steps[currentStep];
    const position = getTooltipPosition(step.position);

    return (
      <Animated.View
        style={[
          styles.tooltip,
          position,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.tooltipHeader}>
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          {renderActionIcon(step.action) && (
            <Text style={styles.actionIcon}>
              {renderActionIcon(step.action)}
            </Text>
          )}
        </View>

        <Text style={styles.tooltipDescription}>{step.description}</Text>

        <View style={styles.tooltipProgress}>
          <Text style={styles.progressText}>
            {currentStep + 1} / {steps.length}
          </Text>
        </View>

        <View style={styles.tooltipButtons}>
          {step.skippable !== false && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>
                {t('guide.skip')}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? t('guide.finish') : t('guide.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // 添加 getTooltipPosition 函数
  const getTooltipPosition = (position?: string) => {
    if (!targetMeasurements) return {};

    switch (position) {
      case 'top':
        return {
          top: targetMeasurements.top - 120,
          left: targetMeasurements.left,
        };
      case 'bottom':
        return {
          top: targetMeasurements.bottom + 20,
          left: targetMeasurements.left,
        };
      case 'left':
        return {
          top: targetMeasurements.top,
          left: targetMeasurements.left - 280,
        };
      case 'right':
        return {
          top: targetMeasurements.top,
          left: targetMeasurements.right + 20,
        };
      default:
        return {
          top: targetMeasurements.bottom + 20,
          left: targetMeasurements.left,
        };
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
    >
      <View style={styles.container}>
        <View style={styles.overlay} />
        {renderHighlight()}
        {renderTooltip()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  highlight: {
    position: 'absolute',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    width: 280,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tooltipDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  actionIcon: {
    fontSize: 24,
    marginLeft: theme.spacing.sm,
  },
  tooltipProgress: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  skipButton: {
    padding: theme.spacing.sm,
  },
  skipButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  nextButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdvancedUserGuide; 