import express from 'express';
import { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 路由
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to LoanEase API',
    version: '1.0.0'
  });
});

// 贷款产品列表路由
app.get('/api/loan-products', (req: Request, res: Response) => {
  res.json([
    {
      id: '1',
      name: 'Personal Loan',
      interestRate: 5.99,
      termRange: {
        min: 12,
        max: 60
      },
      amountRange: {
        min: 1000,
        max: 50000
      }
    },
    {
      id: '2',
      name: 'Business Loan',
      interestRate: 7.99,
      termRange: {
        min: 24,
        max: 120
      },
      amountRange: {
        min: 10000,
        max: 500000
      }
    }
  ]);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 