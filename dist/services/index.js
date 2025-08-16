"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = exports.DriveFilesService = exports.ResourcesService = exports.assignmentService = exports.AssignmentsService = exports.NotesService = void 0;
class NotesService {
    static async findByAuthor(authorId, options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const skip = (page - 1) * limit;
        const query = { author: authorId };
        const [notes, total] = await Promise.all([
            Note_1.Note.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select('-content'),
            Note_1.Note.countDocuments(query)
        ]);
        return { notes, total };
    }
    static async incrementViews(noteId) {
        await Note_1.Note.findByIdAndUpdate(noteId, { $inc: { views: 1 } });
    }
    static async incrementDownloads(noteId) {
        await Note_1.Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });
    }
}
exports.NotesService = NotesService;
class AssignmentsService {
    static async findByInstructor(instructorId, options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const skip = (page - 1) * limit;
        const query = { instructor: instructorId };
        const [assignments, total] = await Promise.all([
            Assignment_1.Assignment.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Assignment_1.Assignment.countDocuments(query)
        ]);
        return { assignments, total };
    }
    static async deactivateExpired() {
        const result = await Assignment_1.Assignment.updateMany({ dueDate: { $lt: new Date() }, isActive: true }, { isActive: false });
        return result.modifiedCount;
    }
}
exports.AssignmentsService = AssignmentsService;
exports.assignmentService = AssignmentsService;
class ResourcesService {
    static async findByAuthor(authorId, options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const skip = (page - 1) * limit;
        const query = { author: authorId };
        const [resources, total] = await Promise.all([
            Resource_1.Resource.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Resource_1.Resource.countDocuments(query)
        ]);
        return { resources, total };
    }
    static async incrementViews(resourceId) {
        await Resource_1.Resource.findByIdAndUpdate(resourceId, { $inc: { views: 1 } });
    }
    static async incrementDownloads(resourceId) {
        await Resource_1.Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });
    }
}
exports.ResourcesService = ResourcesService;
class DriveFilesService {
    static async findByUploader(uploaderId, options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const skip = (page - 1) * limit;
        const query = { uploadedBy: uploaderId };
        const [files, total] = await Promise.all([
            DriveFile_1.DriveFile.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            DriveFile_1.DriveFile.countDocuments(query)
        ]);
        return { files, total };
    }
    static async incrementViews(fileId) {
        await DriveFile_1.DriveFile.findByIdAndUpdate(fileId, { $inc: { views: 1 } });
    }
    static async incrementDownloads(fileId) {
        await DriveFile_1.DriveFile.findByIdAndUpdate(fileId, { $inc: { downloads: 1 } });
    }
}
exports.DriveFilesService = DriveFilesService;
class UsersService {
    static async findByEmail(email) {
        return await User_1.User.findOne({ email, isActive: true });
    }
    static async findByStudentId(studentId) {
        return await User_1.User.findOne({ studentId, isActive: true });
    }
    static async findByEmployeeId(employeeId) {
        return await User_1.User.findOne({ employeeId, isActive: true });
    }
    static async findByCredentials(email, password) {
        const user = await User_1.User.findOne({ email, isActive: true }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return null;
        }
        return user;
    }
    static async create(userData) {
        const user = new User_1.User(userData);
        return await user.save();
    }
    static async update(userId, updateData) {
        return await User_1.User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    }
    static async updatePassword(userId, newPassword) {
        const user = await User_1.User.findById(userId);
        if (!user)
            return null;
        user.password = newPassword;
        return await user.save();
    }
    static async updateLastLogin(userId) {
        await User_1.User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    }
    static async deactivateUser(userId) {
        const result = await User_1.User.findByIdAndUpdate(userId, { isActive: false });
        return !!result;
    }
}
exports.UsersService = UsersService;
const Note_1 = require("../models/Note");
const Assignment_1 = require("../models/Assignment");
const Resource_1 = require("../models/Resource");
const DriveFile_1 = require("../models/DriveFile");
const User_1 = require("../models/User");
//# sourceMappingURL=index.js.map