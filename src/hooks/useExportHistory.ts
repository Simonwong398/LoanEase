import { useState, useEffect } from 'react';
import { ExportHistory } from '../types/export';
import { exportHistoryManager } from '../utils/exportHistoryManager';

export const useExportHistory = (limit?: number) => {
  const [history, setHistory] = useState<ExportHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = exportHistoryManager.getHistory(limit);
        setHistory(data);
      } catch (error) {
        console.error('Failed to load export history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [limit]);

  const addHistoryItem = async (item: ExportHistory) => {
    await exportHistoryManager.addHistoryItem(item);
    setHistory(exportHistoryManager.getHistory(limit));
  };

  const clearHistory = async () => {
    await exportHistoryManager.clearHistory();
    setHistory([]);
  };

  const deleteHistoryItem = async (id: string) => {
    await exportHistoryManager.deleteHistoryItem(id);
    setHistory(exportHistoryManager.getHistory(limit));
  };

  return {
    history,
    loading,
    addHistoryItem,
    clearHistory,
    deleteHistoryItem,
  };
}; 