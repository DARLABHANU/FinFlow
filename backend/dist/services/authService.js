"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const jwt_1 = require("../utils/jwt");
class AuthService {
    async register(email, passwordHash, name) {
        const existing = await userRepository_1.default.findByEmail(email);
        if (existing) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(passwordHash, 12);
        const user = await userRepository_1.default.createUser({ email, passwordHash: hashedPassword, name });
        return { id: user._id, email: user.email, name: user.name };
    }
    async login(email, passwordHash) {
        const user = await userRepository_1.default.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const isMatched = await bcryptjs_1.default.compare(passwordHash, user.passwordHash);
        if (!isMatched) {
            throw new Error('Invalid credentials');
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        return {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                isBiometricEnabled: user.isBiometricEnabled
            },
            accessToken,
            refreshToken
        };
    }
    async refresh(token) {
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(token);
            const user = await userRepository_1.default.findById(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }
            const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
            return { accessToken };
        }
        catch (err) {
            throw new Error('Invalid refresh token');
        }
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
