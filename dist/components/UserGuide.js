"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const useAppSettings_1 = require("../hooks/useAppSettings");
const UserGuide = ({ steps, onComplete, visible, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const { settings } = (0, useAppSettings_1.useAppSettings)();
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    const [targetMeasurements, setTargetMeasurements] = (0, react_1.useState)(null);
    const fadeAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        if (visible) {
            react_native_1.Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, currentStep]);
    const measureTarget = () => {
        const targetId = steps[currentStep].target;
        if (!targetId)
            return;
        const target = document.getElementById(targetId);
        if (target) {
            const rect = target.getBoundingClientRect();
            setTargetMeasurements(rect);
        }
    };
    (0, react_1.useEffect)(() => {
        measureTarget();
    }, [currentStep]);
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
        else {
            onComplete();
        }
    };
    const handleSkip = () => {
        onComplete();
    };
    const renderHighlight = () => {
        if (!targetMeasurements)
            return null;
        return (<react_native_1.View style={[
                styles.highlight,
                {
                    top: targetMeasurements.top,
                    left: targetMeasurements.left,
                    width: targetMeasurements.width,
                    height: targetMeasurements.height,
                },
            ]}/>);
    };
    const renderTooltip = () => {
        const step = steps[currentStep];
        const position = getTooltipPosition(step.position);
        return (<react_native_1.Animated.View style={[styles.tooltip, position, { opacity: fadeAnim }]}>
        <react_native_1.Text style={styles.tooltipTitle}>{step.title}</react_native_1.Text>
        <react_native_1.Text style={styles.tooltipDescription}>{step.description}</react_native_1.Text>
        <react_native_1.View style={styles.tooltipButtons}>
          <react_native_1.TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <react_native_1.Text style={styles.skipButtonText}>
              {t('guide.skip')}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <react_native_1.Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? t('guide.finish') : t('guide.next')}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.Animated.View>);
    };
    const getTooltipPosition = (position) => {
        if (!targetMeasurements)
            return {};
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
    if (!visible)
        return null;
    return (<react_native_1.Modal transparent visible={visible} animationType="fade">
      <react_native_1.View style={styles.container}>
        <react_native_1.View style={styles.overlay}/>
        {renderHighlight()}
        {renderTooltip()}
      </react_native_1.View>
    </react_native_1.Modal>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: Object.assign(Object.assign({}, react_native_1.StyleSheet.absoluteFillObject), { backgroundColor: 'rgba(0, 0, 0, 0.7)' }),
    highlight: {
        position: 'absolute',
        borderRadius: theme_1.theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme_1.theme.colors.primary,
        backgroundColor: 'transparent',
    },
    tooltip: Object.assign({ position: 'absolute', width: 280, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.medium),
    tooltipTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    tooltipDescription: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.md,
    },
    tooltipButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme_1.theme.spacing.sm,
    },
    skipButton: {
        padding: theme_1.theme.spacing.sm,
    },
    skipButtonText: {
        color: theme_1.theme.colors.text.secondary,
        fontSize: 14,
    },
    nextButton: {
        backgroundColor: theme_1.theme.colors.primary,
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    nextButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 14,
        fontWeight: '600',
    },
});
exports.default = UserGuide;
