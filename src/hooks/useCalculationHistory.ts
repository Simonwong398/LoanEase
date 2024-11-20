import { useAsyncStorage } from './useAsyncStorage';

export interface CalculationRecord {
  id: string;
  date: string;
  loanType: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  city?: string;
  paymentMethod: 'equalPayment' | 'equalPrincipal';
}

const HISTORY_KEY = 'loan_calculation_history';
const MAX_HISTORY_ITEMS = 50;

export function useCalculationHistory() {
  const [history, setHistory, loading] = useAsyncStorage<CalculationRecord[]>(HISTORY_KEY, []);

  const addRecord = async (record: Omit<CalculationRecord, 'id' | 'date'>) => {
    const newRecord: CalculationRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedHistory = [newRecord, ...history].slice(0, MAX_HISTORY_ITEMS);
    await setHistory(updatedHistory);
  };

  const deleteRecord = async (id: string) => {
    const updatedHistory = history.filter(record => record.id !== id);
    await setHistory(updatedHistory);
  };

  const clearHistory = async () => {
    await setHistory([]);
  };

  return {
    history,
    loading,
    addRecord,
    deleteRecord,
    clearHistory,
  };
} 