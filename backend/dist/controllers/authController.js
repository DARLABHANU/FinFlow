"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const user = await authService_1.default.register(email, password, name);
        res.status(201).json(user);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService_1.default.login(email, password);
        res.json(data);
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const data = await authService_1.default.refresh(refreshToken);
        res.json(data);
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    // In stateless JWT logout, client just deletes token. 
    // For production, maybe blacklist token in Redis. 
    // Here we'll just confirm logout.
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
