"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformSpecificStyles = exports.isElectron = void 0;
const react_native_1 = require("react-native");
const isElectron = () => {
    return !!(typeof window !== 'undefined' &&
        window.process &&
        window.process.type);
};
exports.isElectron = isElectron;
const getPlatformSpecificStyles = () => {
    if ((0, exports.isElectron)()) {
        return {
            container: {
                maxWidth: 1200,
                margin: 'auto',
            }
        };
    }
    return react_native_1.Platform.select({
        ios: {
            container: {
                paddingTop: 20,
            }
        },
        android: {
            container: {
                paddingTop: 0,
            }
        },
        default: {
            container: {
                paddingTop: 0,
            }
        }
    });
};
exports.getPlatformSpecificStyles = getPlatformSpecificStyles;
