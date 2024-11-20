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
exports.useLPRRate = void 0;
const react_1 = require("react");
const API_URL = 'https://api.example.com/lpr'; // 替换为实际的 API 地址
const useLPRRate = () => {
    const [lprData, setLprData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchLPRData = () => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        try {
            const response = yield fetch(API_URL);
            const data = yield response.json();
            setLprData(data);
            setError(null);
        }
        catch (err) {
            setError('获取LPR利率失败');
            // 使用默认值
            setLprData({
                date: new Date().toISOString(),
                oneYear: 3.45,
                fiveYear: 4.2,
            });
        }
        finally {
            setLoading(false);
        }
    });
    (0, react_1.useEffect)(() => {
        fetchLPRData();
        // 每天更新一次
        const interval = setInterval(fetchLPRData, 24 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    return { lprData, loading, error, refresh: fetchLPRData };
};
exports.useLPRRate = useLPRRate;
