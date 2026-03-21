"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTransactions = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactions = void 0;
const transactionService_1 = __importDefault(require("../services/transactionService"));
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await transactionService_1.default.getTransactions(userId);
        res.json(transactions);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getTransactions = getTransactions;
const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transaction = await transactionService_1.default.createTransaction(userId, req.body);
        res.status(201).json(transaction);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService_1.default.updateTransaction(id, req.body);
        res.json(transaction);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await transactionService_1.default.deleteTransaction(id);
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteTransaction = deleteTransaction;
const syncTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactions } = req.body;
        if (!Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Invalid transactions data' });
        }
        const synced = await transactionService_1.default.syncTransactions(userId, transactions);
        res.json(synced);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.syncTransactions = syncTransactions;
