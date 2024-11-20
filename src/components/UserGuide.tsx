import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
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
}

interface UserGuideProps {
  steps: GuideStep[];
  onComplete: () => void;
  visible: boolean;
}

const UserGuide: React.FC<UserGuideProps> = ({
  steps,
  onComplete,
  visible,
}) => {
  const { t } = useLanguage();
  const { settings } = useAppSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetMeasurements, setTargetMeasurements] = useState<any>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, currentStep]);

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
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderHighlight = () => {
    if (!targetMeasurements) return null;

    return (
      <View
        style={[
          styles.highlight,
          {
            top: targetMeasurements.top,
            left: targetMeasurements.left,
            width: targetMeasurements.width,
            height: targetMeasurements.height,
          },
        ]}
      />
    );
  };

  const renderTooltip = () => {
    const step = steps[currentStep];
    const position = getTooltipPosition(step.position);

    return (
      <Animated.View style={[styles.tooltip, position, { opacity: fadeAnim }]}>
        <Text style={styles.tooltipTitle}>{step.title}</Text>
        <Text style={styles.tooltipDescription}>{step.description}</Text>
        <View style={styles.tooltipButtons}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>
              {t('guide.skip')}
            </Text>
          </TouchableOpacity>
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

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
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

export default UserGuide; 