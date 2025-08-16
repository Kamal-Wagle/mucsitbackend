"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const Assignment_1 = require("../models/Assignment");
const ContentService_1 = require("./ContentService");
class AssignmentService extends ContentService_1.ContentService {
    constructor() {
        super(Assignment_1.Assignment);
    }
    async findById(id, populateInstructor = false) {
        let query = this.model.findById(id);
        if (populateInstructor) {
            query = query.populate('instructor', 'firstName lastName fullName');
        }
        return await query;
    }
    async findAll(options = {}) {
        const { populateInstructor = false } = options;
        const result = await super.findAll(options);
        if (populateInstructor) {
            let query = this.model.find(this.buildQuery(options));
            query = query.populate('instructor', 'firstName lastName fullName');
            const skip = ((options.page || 1) - 1) * (options.limit || 10);
            result.data = await query
                .sort(options.sort || '-createdAt')
                .skip(skip)
                .limit(options.limit || 10);
        }
        return result;
    }
    async findByInstructor(instructorId, options = {}) {
        return await this.findByAuthor(instructorId, options);
    }
    async findActive(options = {}) {
        const filter = { ...options.filter, isActive: true };
        return await this.findAll({ ...options, filter });
    }
    async findExpired(options = {}) {
        const filter = {
            ...options.filter,
            dueDate: { $lt: new Date() },
            isActive: true
        };
        return await this.findAll({ ...options, filter });
    }
    async findUpcoming(days = 7, options = {}) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        const filter = {
            ...options.filter,
            dueDate: { $gte: now, $lte: futureDate },
            isActive: true
        };
        return await this.findAll({ ...options, filter });
    }
    async deactivateExpired() {
        const result = await this.model.updateMany({ dueDate: { $lt: new Date() }, isActive: true }, { isActive: false });
        return result.modifiedCount;
    }
}
exports.AssignmentService = AssignmentService;
//# sourceMappingURL=AssignmentService.js.map