"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapData = exports.getMonthlyTrends = exports.getSpendingBreakdown = void 0;
const transactionRepository_1 = __importDefault(require("../repositories/transactionRepository"));
const getSpendingBreakdown = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await transactionRepository_1.default.findAllByUser(userId);
        const breakdown = {};
        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const amount = parseFloat(tx.amount);
                breakdown[tx.category] = (breakdown[tx.category] || 0) + amount;
            }
        });
        const data = Object.keys(breakdown).map(key => ({
            x: key,
            y: breakdown[key]
        }));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getSpendingBreakdown = getSpendingBreakdown;
const getMonthlyTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await transactionRepository_1.default.findAllByUser(userId);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trends = {};
        transactions.forEach(tx => {
            const date = new Date(tx.timestamp);
            const month = months[date.getMonth()];
            if (!trends[month])
                trends[month] = { income: 0, expense: 0 };
            const amount = parseFloat(tx.amount);
            if (tx.type === 'income') {
                trends[month].income += amount;
            }
            else {
                trends[month].expense += amount;
            }
        });
        const data = months.map(m => ({
            month: m,
            income: trends[m]?.income || 0,
            expense: trends[m]?.expense || 0
        }));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMonthlyTrends = getMonthlyTrends;
const getHeatmapData = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await transactionRepository_1.default.findAllByUser(userId);
        const heatmap = {};
        transactions.forEach(tx => {
            const date = new Date(tx.timestamp).toISOString().split('T')[0];
            const amount = parseFloat(tx.amount);
            heatmap[date] = (heatmap[date] || 0) + amount;
        });
        const data = Object.keys(heatmap).map(date => ({
            date,
            value: heatmap[date]
        }));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getHeatmapData = getHeatmapData;
