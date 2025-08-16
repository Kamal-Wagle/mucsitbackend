"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const User_1 = require("../models/User");
const Note_1 = require("../models/Note");
const Assignment_1 = require("../models/Assignment");
const Resource_1 = require("../models/Resource");
const DriveFile_1 = require("../models/DriveFile");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(types_1.UserRole.ADMIN));
router.get('/dashboard', (0, response_1.handleAsync)(async (req, res) => {
    try {
        let userStats = { total: 0, error: null };
        let noteStats = { total: 0, error: null };
        let assignmentStats = { total: 0, error: null };
        let resourceStats = { total: 0, error: null };
        let driveStats = { total: 0, error: null };
        try {
            userStats.total = await User_1.User.countDocuments({ isActive: true });
        }
        catch (error) {
            userStats.error = 'Failed to get user stats';
            console.error('User stats error:', error);
        }
        try {
            noteStats.total = await Note_1.Note.countDocuments({ isPublic: true });
        }
        catch (error) {
            noteStats.error = 'Failed to get note stats';
            console.error('Note stats error:', error);
        }
        try {
            assignmentStats.total = await Assignment_1.Assignment.countDocuments({ isActive: true });
        }
        catch (error) {
            assignmentStats.error = 'Failed to get assignment stats';
            console.error('Assignment stats error:', error);
        }
        try {
            resourceStats.total = await Resource_1.Resource.countDocuments({ isPublic: true });
        }
        catch (error) {
            resourceStats.error = 'Failed to get resource stats';
            console.error('Resource stats error:', error);
        }
        try {
            driveStats.total = await DriveFile_1.DriveFile.countDocuments({ isPublic: true });
        }
        catch (error) {
            driveStats.error = 'Failed to get drive stats';
            console.error('Drive stats error:', error);
        }
        const stats = {
            users: userStats,
            notes: noteStats,
            assignments: assignmentStats,
            resources: resourceStats,
            driveFiles: driveStats,
            lastUpdated: new Date()
        };
        res.json((0, response_1.createApiResponse)(true, 'Dashboard statistics retrieved', stats));
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve dashboard statistics', null, error.message));
    }
}));
router.get('/users', (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', role, department } = req.query;
        const query = {};
        if (role)
            query.role = role;
        if (department)
            query.department = department;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User_1.User.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-password'),
            User_1.User.countDocuments(query)
        ]);
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Users retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve users', null, error.message));
    }
}));
router.patch('/users/:id/deactivate', (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await User_1.User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        if (!result) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'User not found'));
            return;
        }
        res.json((0, response_1.createApiResponse)(true, 'User deactivated successfully', result));
    }
    catch (error) {
        console.error('User deactivation error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to deactivate user', null, error.message));
    }
}));
router.get('/health', (0, response_1.handleAsync)(async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development'
        };
        res.json((0, response_1.createApiResponse)(true, 'Health check successful', health));
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Health check failed', null, error.message));
    }
}));
exports.default = router;
//# sourceMappingURL=admin.js.map