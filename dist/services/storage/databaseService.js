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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class DatabaseService {
    constructor(filename) {
        this.db = new sqlite3_1.default.Database(filename);
    }
    static getInstance(filename = 'database.sqlite') {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(filename);
        }
        return DatabaseService.instance;
    }
    query(sql_1) {
        return __awaiter(this, arguments, void 0, function* (sql, params = []) {
            return new Promise((resolve, reject) => {
                this.db.all(sql, params, (err, rows) => {
                    if (err)
                        reject(err);
                    else
                        resolve(rows);
                });
            });
        });
    }
    execute(sql_1) {
        return __awaiter(this, arguments, void 0, function* (sql, params = []) {
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        });
    }
    beginTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute('BEGIN TRANSACTION');
        });
    }
    commitTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute('COMMIT');
        });
    }
    rollbackTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute('ROLLBACK');
        });
    }
    getCurrentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.query('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.version) || 0;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        });
    }
}
exports.DatabaseService = DatabaseService;
DatabaseService.instance = null;
