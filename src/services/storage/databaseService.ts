import sqlite3 from 'sqlite3';

export class DatabaseService {
  private db: sqlite3.Database;
  private static instance: DatabaseService | null = null;

  private constructor(filename: string) {
    this.db = new sqlite3.Database(filename);
  }

  static getInstance(filename: string = 'database.sqlite'): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(filename);
    }
    return DatabaseService.instance;
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async beginTransaction(): Promise<void> {
    await this.execute('BEGIN TRANSACTION');
  }

  async commitTransaction(): Promise<void> {
    await this.execute('COMMIT');
  }

  async rollbackTransaction(): Promise<void> {
    await this.execute('ROLLBACK');
  }

  async getCurrentVersion(): Promise<number> {
    const result = await this.query<{ version: number }>(
      'SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1'
    );
    return result[0]?.version || 0;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
} 