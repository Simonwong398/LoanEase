"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransition = void 0;
const react_1 = require("react");
const useTransition = ({ timeout = 300, onEnter, onExit } = {}) => {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [isEntering, setIsEntering] = (0, react_1.useState)(false);
    const [isExiting, setIsExiting] = (0, react_1.useState)(false);
    const enter = (0, react_1.useCallback)(() => {
        if (isExiting)
            return;
        setIsVisible(true);
        setIsEntering(true);
        onEnter === null || onEnter === void 0 ? void 0 : onEnter();
        setTimeout(() => {
            setIsEntering(false);
        }, timeout);
    }, [isExiting, timeout, onEnter]);
    const exit = (0, react_1.useCallback)(() => {
        if (isEntering)
            return;
        setIsExiting(true);
        onExit === null || onExit === void 0 ? void 0 : onExit();
        setTimeout(() => {
            setIsVisible(false);
            setIsExiting(false);
        }, timeout);
    }, [isEntering, timeout, onExit]);
    return {
        isVisible,
        isEntering,
        isExiting,
        enter,
        exit
    };
};
exports.useTransition = useTransition;
