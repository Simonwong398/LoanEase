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
exports.useCalculationHistory = useCalculationHistory;
const useAsyncStorage_1 = require("./useAsyncStorage");
const HISTORY_KEY = 'loan_calculation_history';
const MAX_HISTORY_ITEMS = 50;
function useCalculationHistory() {
    const [history, setHistory, loading] = (0, useAsyncStorage_1.useAsyncStorage)(HISTORY_KEY, []);
    const addRecord = (record) => __awaiter(this, void 0, void 0, function* () {
        const newRecord = Object.assign(Object.assign({}, record), { id: Date.now().toString(), date: new Date().toISOString() });
        const updatedHistory = [newRecord, ...history].slice(0, MAX_HISTORY_ITEMS);
        yield setHistory(updatedHistory);
    });
    const deleteRecord = (id) => __awaiter(this, void 0, void 0, function* () {
        const updatedHistory = history.filter(record => record.id !== id);
        yield setHistory(updatedHistory);
    });
    const clearHistory = () => __awaiter(this, void 0, void 0, function* () {
        yield setHistory([]);
    });
    return {
        history,
        loading,
        addRecord,
        deleteRecord,
        clearHistory,
    };
}
