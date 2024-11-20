"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResponsive = useResponsive;
const react_1 = require("react");
const defaultConfig = {
    mobileBreakpoint: 480,
    tabletBreakpoint: 768,
    desktopBreakpoint: 1024,
    largeDesktopBreakpoint: 1200
};
function useResponsive(config = defaultConfig) {
    const [screenWidth, setScreenWidth] = (0, react_1.useState)(window.innerWidth);
    (0, react_1.useEffect)(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = screenWidth < config.mobileBreakpoint;
    const isTablet = screenWidth >= config.mobileBreakpoint && screenWidth < config.tabletBreakpoint;
    const isDesktop = screenWidth >= config.tabletBreakpoint && screenWidth < config.largeDesktopBreakpoint;
    const isLargeDesktop = screenWidth >= config.largeDesktopBreakpoint;
    const isSmallScreen = screenWidth < config.tabletBreakpoint;
    const isLargeScreen = screenWidth >= config.desktopBreakpoint;
    const getResponsiveValue = (values) => {
        if (isMobile && values.mobile)
            return values.mobile;
        if (isTablet && values.tablet)
            return values.tablet;
        if (isDesktop && values.desktop)
            return values.desktop;
        if (isLargeDesktop && values.largeDesktop)
            return values.largeDesktop;
        return values.default;
    };
    return {
        screenWidth,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        isSmallScreen,
        isLargeScreen,
        getResponsiveValue
    };
}
