"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMediaQuery = void 0;
const react_1 = require("react");
const useMediaQuery = (query) => {
    const [matches, setMatches] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);
        const handler = (event) => {
            setMatches(event.matches);
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);
    return matches;
};
exports.useMediaQuery = useMediaQuery;
