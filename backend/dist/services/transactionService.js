"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transactionRepository_1 = __importDefault(require("../repositories/transactionRepository"));
class TransactionService {
    async getTransactions(userId) {
        return await transactionRepository_1.default.findAllByUser(userId);
    }
    async createTransaction(userId, data) {
        return await transactionRepository_1.default.create(userId, data);
    }
    async updateTransaction(id, data) {
        return await transactionRepository_1.default.update(id, data);
    }
    async deleteTransaction(id) {
        return await transactionRepository_1.default.delete(id);
    }
    async syncTransactions(userId, dataArray) {
        return await transactionRepository_1.default.bulkSync(userId, dataArray);
    }
}
exports.TransactionService = TransactionService;
exports.default = new TransactionService();
