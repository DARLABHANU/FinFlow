"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const ocrRoutes_1 = __importDefault(require("./routes/ocrRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api', limiter);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/ocr', ocrRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
// Error Handling
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
