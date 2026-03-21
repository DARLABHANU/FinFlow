"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = __importDefault(require("../models/User"));
class UserRepository {
    async createUser(userData) {
        const user = new User_1.default(userData);
        return await user.save();
    }
    async findByEmail(email) {
        return await User_1.default.findOne({ email });
    }
    async findById(id) {
        return await User_1.default.findById(id);
    }
    async updateBiometrics(id, isEnabled) {
        return await User_1.default.findByIdAndUpdate(id, { isBiometricEnabled: isEnabled }, { new: true });
    }
}
exports.UserRepository = UserRepository;
exports.default = new UserRepository();
