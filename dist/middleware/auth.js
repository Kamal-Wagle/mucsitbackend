"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.checkResourceOwnership = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const types_1 = require("../types");
const environment_1 = require("../config/environment");
const response_1 = require("../utils/response");
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(401).json((0, response_1.createApiResponse)(false, 'Access token is required'));
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json((0, response_1.createApiResponse)(false, 'Invalid or expired token'));
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json((0, response_1.createApiResponse)(false, 'Invalid or expired token'));
        return;
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, response_1.createApiResponse)(false, 'Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json((0, response_1.createApiResponse)(false, 'Insufficient permissions'));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const checkResourceOwnership = (resourceModel, ownerField = 'author') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params?.id;
            const resource = await resourceModel.findById(resourceId);
            if (!resource) {
                res.status(404).json((0, response_1.createApiResponse)(false, 'Resource not found'));
                return;
            }
            const isOwner = resource[ownerField].toString() === req.user?._id.toString();
            const isAdmin = req.user?.role === types_1.UserRole.ADMIN;
            if (!isOwner && !isAdmin) {
                res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only modify your own resources'));
                return;
            }
            req.resource = resource;
            next();
        }
        catch (error) {
            console.error('Resource ownership check error:', error);
            res.status(500).json((0, response_1.createApiResponse)(false, 'Server error'));
            return;
        }
    };
};
exports.checkResourceOwnership = checkResourceOwnership;
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
            const user = await User_1.User.findById(decoded.userId).select('-password');
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map