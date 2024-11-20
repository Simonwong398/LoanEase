import { useEffect, useState } from 'react';

interface LPRData {
  date: string;
  oneYear: number;
  fiveYear: number;
}

const API_URL = 'https://api.example.com/lpr'; // 替换为实际的 API 地址

export const useLPRRate = () => {
  const [lprData, setLprData] = useState<LPRData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLPRData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLprData(data);
      setError(null);
    } catch (err) {
      setError('获取LPR利率失败');
      // 使用默认值
      setLprData({
        date: new Date().toISOString(),
        oneYear: 3.45,
        fiveYear: 4.2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLPRData();
    // 每天更新一次
    const interval = setInterval(fetchLPRData, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { lprData, loading, error, refresh: fetchLPRData };
}; 