import { DatabaseService } from '../storage';

interface MigrationConfig {
  version: number;
  description: string;
  up: (db: DatabaseService) => Promise<void>;
  down: (db: DatabaseService) => Promise<void>;
}

export class MigrationService {
  private migrations: Map<number, MigrationConfig> = new Map();
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  // 注册迁移
  registerMigration(config: MigrationConfig): void {
    this.migrations.set(config.version, config);
  }

  // 执行迁移
  async migrate(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();

    try {
      await this.db.beginTransaction();

      if (targetVersion > currentVersion) {
        // 向上迁移
        for (let v = currentVersion + 1; v <= targetVersion; v++) {
          const migration = this.migrations.get(v);
          if (migration) {
            await migration.up(this.db);
            await this.updateVersion(v);
          }
        }
      } else if (targetVersion < currentVersion) {
        // 向下迁移
        for (let v = currentVersion; v > targetVersion; v--) {
          const migration = this.migrations.get(v);
          if (migration) {
            await migration.down(this.db);
            await this.updateVersion(v - 1);
          }
        }
      }

      await this.db.commitTransaction();
    } catch (error) {
      await this.db.rollbackTransaction();
      throw error;
    }
  }

  private async getCurrentVersion(): Promise<number> {
    const result = await this.db.query<{ version: number }>(
      'SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1'
    );
    return result[0]?.version || 0;
  }

  private async updateVersion(version: number): Promise<void> {
    await this.db.execute(
      'INSERT INTO schema_migrations (version) VALUES (?)',
      [version]
    );
  }
} 