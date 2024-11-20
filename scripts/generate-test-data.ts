const { faker } = require('@faker-js/faker');
const { DatabaseService } = require('../src/services/storage');
const { logger } = require('../src/utils/logger');

interface TestData {
  name: string;
  email: string;
  phone: string;
}

async function generateTestData(): Promise<void> {
  try {
    const db = DatabaseService.getInstance();
    
    // 生成测试数据
    const testData: TestData[] = Array.from({ length: 10 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number()
    }));

    // 插入数据
    for (const data of testData) {
      await db.execute(
        'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
        [data.name, data.email, data.phone]
      );
    }

    logger.info('Test data generated successfully');
  } catch (error) {
    logger.error('Failed to generate test data', error);
    throw error;
  }
}

// 执行函数
generateTestData().catch(console.error); 