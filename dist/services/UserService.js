"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = require("../models/User");
const BaseService_1 = require("./BaseService");
class UserService extends BaseService_1.BaseService {
    constructor() {
        super(User_1.User);
    }
    async findByEmail(email) {
        return await this.model.findOne({ email, isActive: true });
    }
    async findByCredentials(email, password) {
        const user = await this.model.findOne({ email, isActive: true }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return null;
        }
        return user;
    }
    async updatePassword(id, newPassword) {
        const user = await this.model.findById(id);
        if (!user)
            return false;
        user.password = newPassword;
        await user.save();
        return true;
    }
    async updateLastLogin(id) {
        await this.model.findByIdAndUpdate(id, { lastLogin: new Date() });
    }
    async findByStudentId(studentId) {
        return await this.model.findOne({ studentId, isActive: true });
    }
    async findByEmployeeId(employeeId) {
        return await this.model.findOne({ employeeId, isActive: true });
    }
    async deactivateUser(id) {
        const result = await this.model.findByIdAndUpdate(id, { isActive: false });
        return !!result;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map