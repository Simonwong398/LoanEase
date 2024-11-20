// 处理JavaScript浮点数计算精度问题
export const precise = {
  add: (a: number, b: number): number => {
    const precision = Math.pow(10, 10);
    return Math.round((a + b) * precision) / precision;
  },
  
  subtract: (a: number, b: number): number => {
    const precision = Math.pow(10, 10);
    return Math.round((a - b) * precision) / precision;
  },
  
  multiply: (a: number, b: number): number => {
    const precision = Math.pow(10, 10);
    return Math.round((a * b) * precision) / precision;
  },
  
  divide: (a: number, b: number): number => {
    if (b === 0) throw new Error('Division by zero');
    const precision = Math.pow(10, 10);
    return Math.round((a / b) * precision) / precision;
  },

  round: (num: number, decimals: number = 2): number => {
    const precision = Math.pow(10, decimals);
    return Math.round(num * precision) / precision;
  }
}; 