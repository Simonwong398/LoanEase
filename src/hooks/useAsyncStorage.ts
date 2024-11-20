import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, []);

  async function loadStoredValue() {
    try {
      const item = await AsyncStorage.getItem(key);
      const value = item ? JSON.parse(item) : initialValue;
      setStoredValue(value);
    } catch (error) {
      console.error('Error loading stored value:', error);
    } finally {
      setLoading(false);
    }
  }

  async function setValue(value: T) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.error('Error saving value:', error);
    }
  }

  return [storedValue, setValue, loading];
} 