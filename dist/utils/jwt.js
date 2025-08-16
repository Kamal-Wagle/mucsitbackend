"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const generateToken = (userId) => {
    const secret = environment_1.config.jwt.secret;
    if (!secret) {
        throw new Error('JWT secret is not configured');
    }
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: environment_1.config.jwt.expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const secret = environment_1.config.jwt.secret;
    if (!secret) {
        throw new Error('JWT secret is not configured');
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const generateTokens = (user) => {
    const accessToken = (0, exports.generateToken)(user._id);
    return {
        accessToken,
        user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            role: user.role,
            department: user.department,
            studentId: user.studentId,
            employeeId: user.employeeId
        }
    };
};
exports.generateTokens = generateTokens;
//# sourceMappingURL=jwt.js.map