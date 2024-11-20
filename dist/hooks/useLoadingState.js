"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLoadingState = void 0;
const react_1 = require("react");
const useLoadingState = (initialState = {}) => {
    const [state, setState] = (0, react_1.useState)(Object.assign({ loading: false, progress: 0, error: null }, initialState));
    const startLoading = (0, react_1.useCallback)(() => {
        setState(prev => (Object.assign(Object.assign({}, prev), { loading: true, error: null })));
    }, []);
    const setProgress = (0, react_1.useCallback)((progress) => {
        setState(prev => (Object.assign(Object.assign({}, prev), { progress })));
    }, []);
    const setError = (0, react_1.useCallback)((error) => {
        setState(prev => (Object.assign(Object.assign({}, prev), { error, loading: false })));
    }, []);
    const finishLoading = (0, react_1.useCallback)(() => {
        setState(prev => (Object.assign(Object.assign({}, prev), { loading: false, progress: 100 })));
    }, []);
    const reset = (0, react_1.useCallback)(() => {
        setState({ loading: false, progress: 0, error: null });
    }, []);
    return Object.assign(Object.assign({}, state), { startLoading,
        setProgress,
        setError,
        finishLoading,
        reset });
};
exports.useLoadingState = useLoadingState;
