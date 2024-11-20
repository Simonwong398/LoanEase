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
exports.IndexManager = void 0;
class IndexManager {
    constructor(db) {
        this.db = db;
    }
    // 创建索引
    createIndex(definition) {
        return __awaiter(this, void 0, void 0, function* () {
            const indexName = definition.name ||
                `idx_${definition.tableName}_${definition.columnNames.join('_')}`;
            const uniqueClause = definition.unique ? 'UNIQUE' : '';
            const sql = `
      CREATE ${uniqueClause} INDEX IF NOT EXISTS ${indexName}
      ON ${definition.tableName} (${definition.columnNames.join(', ')})
    `;
            try {
                yield this.db.execute(sql);
            }
            catch (error) {
                throw new Error(`Failed to create index: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 删除索引
    dropIndex(indexName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.execute(`DROP INDEX IF EXISTS ${indexName}`);
            }
            catch (error) {
                throw new Error(`Failed to drop index: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 获取索引统计信息
    getIndexStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = new Map();
                const indexes = yield this.db.query(`
        SELECT 
          name,
          tbl_name as tableName
        FROM sqlite_master 
        WHERE type = 'index'
      `);
                for (const index of indexes) {
                    const usage = yield this.getIndexUsage(index.name);
                    stats.set(index.name, {
                        name: index.name,
                        size: yield this.getIndexSize(index.name),
                        usage: usage.count,
                        lastUsed: usage.lastUsed
                    });
                }
                return stats;
            }
            catch (error) {
                throw new Error(`Failed to get index stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 分析索引使用情况
    analyzeIndexUsage(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.execute(`ANALYZE ${tableName}`);
            }
            catch (error) {
                throw new Error(`Failed to analyze index usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 优化索引
    optimizeIndexes(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 获取表的统计信息
                yield this.analyzeIndexUsage(tableName);
                // 获取所有索引
                const indexes = yield this.getTableIndexes(tableName);
                // 分析每个索引的使用情况
                const stats = yield this.getIndexStats();
                // 删除未使用的索引
                for (const index of indexes) {
                    const indexStats = stats.get(index.name);
                    if (indexStats && indexStats.usage === 0) {
                        yield this.dropIndex(index.name);
                    }
                }
            }
            catch (error) {
                throw new Error(`Failed to optimize indexes: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    getIndexSize(indexName) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取索引大小的逻辑
            return 0;
        });
    }
    getIndexUsage(indexName) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取索引使用情况的逻辑
            return { count: 0 };
        });
    }
    getTableIndexes(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.query(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index'
      AND tbl_name = ?
    `, [tableName]);
        });
    }
}
exports.IndexManager = IndexManager;
