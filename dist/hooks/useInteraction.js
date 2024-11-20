"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInteraction = void 0;
const react_1 = require("react");
const useInteraction = (options = {}) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleInteraction = (0, react_1.useCallback)((action) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            setLoading(true);
            setError(null);
            (_a = options.onStart) === null || _a === void 0 ? void 0 : _a.call(options);
            yield action();
            (_b = options.onSuccess) === null || _b === void 0 ? void 0 : _b.call(options);
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            (_c = options.onError) === null || _c === void 0 ? void 0 : _c.call(options, error);
        }
        finally {
            setLoading(false);
            (_d = options.onEnd) === null || _d === void 0 ? void 0 : _d.call(options);
        }
    }), [options]);
    return {
        loading,
        error,
        handleInteraction
    };
};
exports.useInteraction = useInteraction;
