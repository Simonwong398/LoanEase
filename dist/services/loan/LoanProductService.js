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
exports.LoanProductService = void 0;
const logger_1 = require("@utils/logger");
class LoanProductService {
    constructor(db) {
        this.db = db;
    }
    // 创建贷款产品
    createProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newProduct = Object.assign(Object.assign({}, product), { id: `prod_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() });
                yield this.db.execute('INSERT INTO loan_products (id, type, name, description, min_amount, max_amount, interest_rate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [newProduct.id, newProduct.type, newProduct.name, newProduct.description, newProduct.minAmount, newProduct.maxAmount, newProduct.interestRate, newProduct.createdAt, newProduct.updatedAt]);
                logger_1.logger.info('Created new loan product', 'LoanProductService', { productId: newProduct.id });
                return newProduct;
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
                logger_1.logger.error('Failed to create loan product', 'LoanProductService', error);
                throw error;
            }
        });
    }
    // 获取可用贷款产品
    getAvailableProducts(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = 'SELECT * FROM loan_products WHERE is_active = true';
                const params = [];
                if (filters.type) {
                    query += ' AND type = ?';
                    params.push(filters.type);
                }
                if (filters.minAmount) {
                    query += ' AND max_amount >= ?';
                    params.push(filters.minAmount);
                }
                if (filters.maxAmount) {
                    query += ' AND min_amount <= ?';
                    params.push(filters.maxAmount);
                }
                return yield this.db.query(query, params);
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
                logger_1.logger.error('Failed to get available products', 'LoanProductService', error);
                throw error;
            }
        });
    }
    // 检查贷款资格
    checkEligibility(productId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.getProductById(productId);
                if (!product) {
                    throw new Error('Product not found');
                }
                const reasons = [];
                if (userData.creditScore < product.eligibilityCriteria.minCreditScore) {
                    reasons.push('Credit score below minimum requirement');
                }
                if (userData.monthlyIncome < product.eligibilityCriteria.minIncome) {
                    reasons.push('Income below minimum requirement');
                }
                if (userData.employmentYears < product.eligibilityCriteria.minEmploymentYears) {
                    reasons.push('Employment history below minimum requirement');
                }
                const eligible = reasons.length === 0;
                const maxAmount = eligible ? this.calculateMaxLoanAmount(userData.monthlyIncome) : undefined;
                return { eligible, maxAmount, reasons };
            }
            catch (err) {
                const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
                logger_1.logger.error('Failed to check eligibility', 'LoanProductService', error);
                throw error;
            }
        });
    }
    getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.db.query('SELECT * FROM loan_products WHERE id = ?', [id]);
            return products[0] || null;
        });
    }
    calculateMaxLoanAmount(monthlyIncome) {
        // 假设最大贷款额度为年收入的4倍
        return monthlyIncome * 12 * 4;
    }
}
exports.LoanProductService = LoanProductService;
