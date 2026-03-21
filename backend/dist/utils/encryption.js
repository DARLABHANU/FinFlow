"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'fallback-secret-for-development-only';
const encrypt = (data) => {
    return crypto_js_1.default.AES.encrypt(data, SECRET_KEY).toString();
};
exports.encrypt = encrypt;
const decrypt = (ciphertext) => {
    const bytes = crypto_js_1.default.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.decrypt = decrypt;
