"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnimation = void 0;
const react_1 = require("react");
const useAnimation = ({ name, duration = 300, delay = 0, timingFunction = 'ease' }) => {
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(false);
    const [hasAnimated, setHasAnimated] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setHasAnimated(true);
                setIsAnimating(false);
            }, duration + delay);
            return () => clearTimeout(timer);
        }
    }, [isAnimating, duration, delay]);
    const style = {
        animation: isAnimating ? `${name} ${duration}ms ${timingFunction} ${delay}ms` : '',
        opacity: !isAnimating && !hasAnimated ? 0 : 1
    };
    const startAnimation = () => {
        setIsAnimating(true);
    };
    const resetAnimation = () => {
        setIsAnimating(false);
        setHasAnimated(false);
    };
    return { style, startAnimation, resetAnimation, isAnimating, hasAnimated };
};
exports.useAnimation = useAnimation;
