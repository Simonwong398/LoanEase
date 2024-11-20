"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeviceAdaptation = void 0;
const react_native_1 = require("react-native");
const react_1 = require("react");
const useDeviceAdaptation = () => {
    const window = (0, react_native_1.useWindowDimensions)();
    const [orientation, setOrientation] = (0, react_1.useState)(window.width < window.height ? 'portrait' : 'landscape');
    (0, react_1.useEffect)(() => {
        setOrientation(window.width < window.height ? 'portrait' : 'landscape');
    }, [window.width, window.height]);
    const getDeviceType = (dimensions) => {
        const { width, height } = dimensions;
        const screenSize = Math.sqrt(width * width + height * height);
        return {
            isSmallDevice: screenSize < 750, // iPhone SE 等小屏设备
            isMediumDevice: screenSize >= 750 && screenSize < 1000, // 标准手机
            isLargeDevice: screenSize >= 1000, // 大屏手机
            isTablet: react_native_1.Platform.OS === 'ios' ? react_native_1.Platform.isPad : screenSize >= 1200,
        };
    };
    const { isSmallDevice, isMediumDevice, isLargeDevice, isTablet } = getDeviceType(window);
    // 根据设备类型和方向计算基础间距和字体大小
    const calculateBaseMetrics = () => {
        let baseSpacing = 8;
        let baseFontSize = 14;
        if (isTablet) {
            baseSpacing = 12;
            baseFontSize = 16;
        }
        else if (isLargeDevice) {
            baseSpacing = 10;
            baseFontSize = 15;
        }
        else if (isSmallDevice) {
            baseSpacing = 6;
            baseFontSize = 13;
        }
        // 横屏时调整
        if (orientation === 'landscape' && !isTablet) {
            baseSpacing = Math.floor(baseSpacing * 0.9);
            baseFontSize = Math.floor(baseFontSize * 0.9);
        }
        return { baseSpacing, baseFontSize };
    };
    const { baseSpacing, baseFontSize } = calculateBaseMetrics();
    return {
        isSmallDevice,
        isMediumDevice,
        isLargeDevice,
        isTablet,
        isLandscape: orientation === 'landscape',
        screenWidth: window.width,
        screenHeight: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
        baseSpacing,
        baseFontSize,
    };
};
exports.useDeviceAdaptation = useDeviceAdaptation;
