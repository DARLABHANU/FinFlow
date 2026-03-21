"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ message: 'No authorization header' });
    const token = authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Bearer token missing' });
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded; // Attached decoded payload (contains id)
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
