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
exports.IntegrityService = void 0;
const crypto_1 = require("crypto");
class IntegrityService {
    constructor(db) {
        this.db = db;
    }
    // 执行完整性检查
    checkIntegrity() {
        return __awaiter(this, arguments, void 0, function* (type = 'full') {
            const check = {
                id: this.generateCheckId(),
                type,
                startTime: new Date(),
                status: 'running',
                results: []
            };
            try {
                // 获取所有表
                const tables = yield this.getTables();
                const errors = [];
                // 检查每个表
                for (const table of tables) {
                    try {
                        const checksum = yield this.calculateTableChecksum(table);
                        check.results.push({
                            tableName: table,
                            checksum,
                            timestamp: new Date()
                        });
                        // 验证外键约束
                        yield this.verifyForeignKeys(table);
                        // 验证唯一约束
                        yield this.verifyUniqueConstraints(table);
                        // 验证非空约束
                        yield this.verifyNotNullConstraints(table);
                    }
                    catch (error) {
                        errors.push(`Error checking table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
                check.status = 'completed';
                check.endTime = new Date();
                if (errors.length > 0) {
                    check.errors = errors;
                }
                // 保存检查结果
                yield this.saveIntegrityCheck(check);
                return check;
            }
            catch (error) {
                check.status = 'failed';
                check.endTime = new Date();
                check.errors = [error instanceof Error ? error.message : 'Unknown error'];
                yield this.saveIntegrityCheck(check);
                throw error;
            }
        });
    }
    // 验证数据一致性
    verifyConsistency(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 获取最近的检查结果
                const lastCheck = yield this.getLastChecksum(table);
                if (!lastCheck)
                    return true;
                // 计算当前校验和
                const currentChecksum = yield this.calculateTableChecksum(table);
                return currentChecksum === lastCheck.checksum;
            }
            catch (error) {
                throw new Error(`Consistency verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 修复数据不一致
    repairInconsistencies(table) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.beginTransaction();
                // 验证并修复外键约束
                yield this.repairForeignKeys(table);
                // 验证并修复唯一约束
                yield this.repairUniqueConstraints(table);
                // 验证并修复非空约束
                yield this.repairNotNullConstraints(table);
                yield this.db.commitTransaction();
            }
            catch (error) {
                yield this.db.rollbackTransaction();
                throw new Error(`Repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    generateCheckId() {
        return `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getTables() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            return result.map(row => row.name);
        });
    }
    calculateTableChecksum(table) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.db.query(`SELECT * FROM ${table} ORDER BY rowid`);
            const hash = (0, crypto_1.createHash)('sha256');
            rows.forEach(row => hash.update(JSON.stringify(row)));
            return hash.digest('hex');
        });
    }
    verifyForeignKeys(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现外键约束验证
        });
    }
    verifyUniqueConstraints(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现唯一约束验证
        });
    }
    verifyNotNullConstraints(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现非空约束验证
        });
    }
    repairForeignKeys(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现外键约束修复
        });
    }
    repairUniqueConstraints(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现唯一约束修复
        });
    }
    repairNotNullConstraints(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现非空约束修复
        });
    }
    saveIntegrityCheck(check) {
        return __awaiter(this, void 0, void 0, function* () {
            // 保存检查结果到数据库
        });
    }
    getLastChecksum(table) {
        return __awaiter(this, void 0, void 0, function* () {
            // 获取最近的校验和记录
            return null;
        });
    }
}
exports.IntegrityService = IntegrityService;
