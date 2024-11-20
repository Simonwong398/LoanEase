import { DatabaseService } from '../storage';

interface IndexDefinition {
  tableName: string;
  columnNames: string[];
  unique?: boolean;
  name?: string;
}

interface IndexStats {
  name: string;
  size: number;
  usage: number;
  lastUsed?: Date;
}

export class IndexManager {
  constructor(private db: DatabaseService) {}

  // 创建索引
  async createIndex(definition: IndexDefinition): Promise<void> {
    const indexName = definition.name || 
      `idx_${definition.tableName}_${definition.columnNames.join('_')}`;
    
    const uniqueClause = definition.unique ? 'UNIQUE' : '';
    const sql = `
      CREATE ${uniqueClause} INDEX IF NOT EXISTS ${indexName}
      ON ${definition.tableName} (${definition.columnNames.join(', ')})
    `;

    try {
      await this.db.execute(sql);
    } catch (error) {
      throw new Error(`Failed to create index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 删除索引
  async dropIndex(indexName: string): Promise<void> {
    try {
      await this.db.execute(`DROP INDEX IF EXISTS ${indexName}`);
    } catch (error) {
      throw new Error(`Failed to drop index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 获取索引统计信息
  async getIndexStats(): Promise<Map<string, IndexStats>> {
    try {
      const stats = new Map<string, IndexStats>();
      const indexes = await this.db.query<any>(`
        SELECT 
          name,
          tbl_name as tableName
        FROM sqlite_master 
        WHERE type = 'index'
      `);

      for (const index of indexes) {
        const usage = await this.getIndexUsage(index.name);
        stats.set(index.name, {
          name: index.name,
          size: await this.getIndexSize(index.name),
          usage: usage.count,
          lastUsed: usage.lastUsed
        });
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get index stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 分析索引使用情况
  async analyzeIndexUsage(tableName: string): Promise<void> {
    try {
      await this.db.execute(`ANALYZE ${tableName}`);
    } catch (error) {
      throw new Error(`Failed to analyze index usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 优化索引
  async optimizeIndexes(tableName: string): Promise<void> {
    try {
      // 获取表的统计信息
      await this.analyzeIndexUsage(tableName);

      // 获取所有索引
      const indexes = await this.getTableIndexes(tableName);

      // 分析每个索引的使用情况
      const stats = await this.getIndexStats();

      // 删除未使用的索引
      for (const index of indexes) {
        const indexStats = stats.get(index.name);
        if (indexStats && indexStats.usage === 0) {
          await this.dropIndex(index.name);
        }
      }
    } catch (error) {
      throw new Error(`Failed to optimize indexes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getIndexSize(indexName: string): Promise<number> {
    // 实现获取索引大小的逻辑
    return 0;
  }

  private async getIndexUsage(indexName: string): Promise<{ count: number; lastUsed?: Date }> {
    // 实现获取索引使用情况的逻辑
    return { count: 0 };
  }

  private async getTableIndexes(tableName: string): Promise<{ name: string }[]> {
    return this.db.query<{ name: string }>(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index'
      AND tbl_name = ?
    `, [tableName]);
  }
} 