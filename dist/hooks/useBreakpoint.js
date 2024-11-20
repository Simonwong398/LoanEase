"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBreakpoint = void 0;
const react_1 = require("react");
const breakpoints = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
};
const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = (0, react_1.useState)('xs');
    (0, react_1.useEffect)(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= breakpoints.xl)
                setBreakpoint('xl');
            else if (width >= breakpoints.lg)
                setBreakpoint('lg');
            else if (width >= breakpoints.md)
                setBreakpoint('md');
            else if (width >= breakpoints.sm)
                setBreakpoint('sm');
            else
                setBreakpoint('xs');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return breakpoint;
};
exports.useBreakpoint = useBreakpoint;
