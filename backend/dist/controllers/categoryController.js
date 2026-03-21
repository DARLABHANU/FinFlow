"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const getCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find();
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const category = new Category_1.default(req.body);
        await category.save();
        res.status(201).json(category);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createCategory = createCategory;
