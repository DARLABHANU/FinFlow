"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const encryption_1 = require("../utils/encryption");
class TransactionRepository {
    encryptSensitive(data) {
        if (data.amount) {
            data.amount = (0, encryption_1.encrypt)(data.amount.toString());
        }
        if (data.note) {
            data.note = (0, encryption_1.encrypt)(data.note);
        }
        return data;
    }
    decryptSensitive(transaction) {
        const raw = transaction.toObject();
        if (raw.amount) {
            raw.amount = (0, encryption_1.decrypt)(raw.amount);
        }
        if (raw.note) {
            raw.note = (0, encryption_1.decrypt)(raw.note);
        }
        return raw;
    }
    async create(userId, data) {
        const encryptedData = this.encryptSensitive({ ...data, userId });
        const transaction = new Transaction_1.default(encryptedData);
        const saved = await transaction.save();
        return this.decryptSensitive(saved);
    }
    async findAllByUser(userId) {
        const transactions = await Transaction_1.default.find({ userId }).sort({ timestamp: -1 });
        return transactions.map(t => this.decryptSensitive(t));
    }
    async findById(id) {
        const transaction = await Transaction_1.default.findById(id);
        return transaction ? this.decryptSensitive(transaction) : null;
    }
    async update(id, data) {
        const encryptedData = this.encryptSensitive(data);
        const updated = await Transaction_1.default.findByIdAndUpdate(id, encryptedData, { new: true });
        return updated ? this.decryptSensitive(updated) : null;
    }
    async delete(id) {
        const result = await Transaction_1.default.findByIdAndDelete(id);
        return result !== null;
    }
    async bulkSync(userId, dataArray) {
        const encryptedArray = dataArray.map(data => this.encryptSensitive({ ...data, userId, isSynced: true }));
        const saved = await Transaction_1.default.insertMany(encryptedArray);
        return saved.map(t => this.decryptSensitive(t));
    }
}
exports.TransactionRepository = TransactionRepository;
exports.default = new TransactionRepository();
