"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const services_1 = require("../services");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
exports.register = (0, response_1.handleAsync)(async (req, res) => {
    const { email, password, firstName, lastName, role, studentId, employeeId, department } = req.body;
    const existingUser = await services_1.UsersService.findByEmail(email);
    if (existingUser) {
        return res.status(409).json((0, response_1.createApiResponse)(false, 'User with this email already exists'));
    }
    if (studentId) {
        const existingStudent = await services_1.UsersService.findByStudentId(studentId);
        if (existingStudent) {
            return res.status(409).json((0, response_1.createApiResponse)(false, 'Student ID already exists'));
        }
    }
    if (employeeId) {
        const existingEmployee = await services_1.UsersService.findByEmployeeId(employeeId);
        if (existingEmployee) {
            return res.status(409).json((0, response_1.createApiResponse)(false, 'Employee ID already exists'));
        }
    }
    const user = await services_1.UsersService.create({
        email,
        password,
        firstName,
        lastName,
        role,
        studentId,
        employeeId,
        department
    });
    const tokens = (0, jwt_1.generateTokens)(user);
    return res.status(201).json((0, response_1.createApiResponse)(true, 'User registered successfully', tokens));
});
exports.login = (0, response_1.handleAsync)(async (req, res) => {
    const { email, password } = req.body;
    const user = await services_1.UsersService.findByCredentials(email, password);
    if (!user) {
        return res.status(401).json((0, response_1.createApiResponse)(false, 'Invalid email or password'));
    }
    await services_1.UsersService.updateLastLogin(user._id);
    const tokens = (0, jwt_1.generateTokens)(user);
    return res.json((0, response_1.createApiResponse)(true, 'Login successful', tokens));
});
exports.getProfile = (0, response_1.handleAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json((0, response_1.createApiResponse)(false, 'User not found'));
    }
    const profile = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        employeeId: user.employeeId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
    };
    return res.json((0, response_1.createApiResponse)(true, 'Profile retrieved successfully', profile));
});
exports.updateProfile = (0, response_1.handleAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { firstName, lastName, department } = req.body;
    const user = await services_1.UsersService.update(userId, { firstName, lastName, department });
    if (!user) {
        return res.status(404).json((0, response_1.createApiResponse)(false, 'User not found'));
    }
    return res.json((0, response_1.createApiResponse)(true, 'Profile updated successfully', user));
});
exports.changePassword = (0, response_1.handleAsync)(async (req, res) => {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    const user = await services_1.UsersService.findByCredentials(req.user.email, currentPassword);
    if (!user) {
        return res.status(400).json((0, response_1.createApiResponse)(false, 'Current password is incorrect'));
    }
    await services_1.UsersService.updatePassword(userId, newPassword);
    return res.json((0, response_1.createApiResponse)(true, 'Password changed successfully'));
});
exports.logout = (0, response_1.handleAsync)(async (req, res) => {
    return res.json((0, response_1.createApiResponse)(true, 'Logged out successfully'));
});
//# sourceMappingURL=authController.js.map