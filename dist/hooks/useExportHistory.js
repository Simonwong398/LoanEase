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
exports.useExportHistory = void 0;
const react_1 = require("react");
const exportHistoryManager_1 = require("../utils/exportHistoryManager");
const useExportHistory = (limit) => {
    const [history, setHistory] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const loadHistory = () => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            try {
                const data = exportHistoryManager_1.exportHistoryManager.getHistory(limit);
                setHistory(data);
            }
            catch (error) {
                console.error('Failed to load export history:', error);
            }
            finally {
                setLoading(false);
            }
        });
        loadHistory();
    }, [limit]);
    const addHistoryItem = (item) => __awaiter(void 0, void 0, void 0, function* () {
        yield exportHistoryManager_1.exportHistoryManager.addHistoryItem(item);
        setHistory(exportHistoryManager_1.exportHistoryManager.getHistory(limit));
    });
    const clearHistory = () => __awaiter(void 0, void 0, void 0, function* () {
        yield exportHistoryManager_1.exportHistoryManager.clearHistory();
        setHistory([]);
    });
    const deleteHistoryItem = (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield exportHistoryManager_1.exportHistoryManager.deleteHistoryItem(id);
        setHistory(exportHistoryManager_1.exportHistoryManager.getHistory(limit));
    });
    return {
        history,
        loading,
        addHistoryItem,
        clearHistory,
        deleteHistoryItem,
    };
};
exports.useExportHistory = useExportHistory;
