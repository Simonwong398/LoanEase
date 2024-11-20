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
exports.MigrationService = void 0;
class MigrationService {
    constructor(db) {
        this.migrations = new Map();
        this.db = db;
    }
    // 注册迁移
    registerMigration(config) {
        this.migrations.set(config.version, config);
    }
    // 执行迁移
    migrate(targetVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentVersion = yield this.getCurrentVersion();
            try {
                yield this.db.beginTransaction();
                if (targetVersion > currentVersion) {
                    // 向上迁移
                    for (let v = currentVersion + 1; v <= targetVersion; v++) {
                        const migration = this.migrations.get(v);
                        if (migration) {
                            yield migration.up(this.db);
                            yield this.updateVersion(v);
                        }
                    }
                }
                else if (targetVersion < currentVersion) {
                    // 向下迁移
                    for (let v = currentVersion; v > targetVersion; v--) {
                        const migration = this.migrations.get(v);
                        if (migration) {
                            yield migration.down(this.db);
                            yield this.updateVersion(v - 1);
                        }
                    }
                }
                yield this.db.commitTransaction();
            }
            catch (error) {
                yield this.db.rollbackTransaction();
                throw error;
            }
        });
    }
    getCurrentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.db.query('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.version) || 0;
        });
    }
    updateVersion(version) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.execute('INSERT INTO schema_migrations (version) VALUES (?)', [version]);
        });
    }
}
exports.MigrationService = MigrationService;
