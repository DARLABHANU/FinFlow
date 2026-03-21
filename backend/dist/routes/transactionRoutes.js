"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionController = __importStar(require("../controllers/transactionController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_validator_1 = require("express-validator");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate); // All transaction routes are protected
router.post('/sync', transactionController.syncTransactions);
router.get('/', transactionController.getTransactions);
router.post('/', [
    (0, express_validator_1.body)('amount').isNumeric().withMessage('Amount must be a number'),
    (0, express_validator_1.body)('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    validateMiddleware_1.validate
], transactionController.createTransaction);
router.put('/:id', [
    (0, express_validator_1.body)('amount').optional().isNumeric().withMessage('Amount must be a number'),
    (0, express_validator_1.body)('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    validateMiddleware_1.validate
], transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
exports.default = router;
