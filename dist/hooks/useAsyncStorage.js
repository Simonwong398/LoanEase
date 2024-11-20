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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAsyncStorage = useAsyncStorage;
const react_1 = require("react");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
function useAsyncStorage(key, initialValue) {
    const [storedValue, setStoredValue] = (0, react_1.useState)(initialValue);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        loadStoredValue();
    }, []);
    function loadStoredValue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield async_storage_1.default.getItem(key);
                const value = item ? JSON.parse(item) : initialValue;
                setStoredValue(value);
            }
            catch (error) {
                console.error('Error loading stored value:', error);
            }
            finally {
                setLoading(false);
            }
        });
    }
    function setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem(key, JSON.stringify(value));
                setStoredValue(value);
            }
            catch (error) {
                console.error('Error saving value:', error);
            }
        });
    }
    return [storedValue, setValue, loading];
}
