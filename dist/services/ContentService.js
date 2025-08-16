"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const BaseService_1 = require("./BaseService");
class ContentService extends BaseService_1.BaseService {
    async findByAuthor(authorId, options = {}) {
        const filter = { ...options.filter, author: authorId };
        return await this.findAll({ ...options, filter });
    }
    async incrementViews(id) {
        await this.model.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }
    async incrementDownloads(id) {
        await this.model.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
    }
    async search(query, options = {}) {
        return await this.findAll({ ...options, search: query });
    }
    async findPublic(options = {}) {
        const filter = { ...options.filter, isPublic: true };
        return await this.findAll({ ...options, filter });
    }
    async findByDepartment(department, options = {}) {
        const filter = { ...options.filter, department };
        return await this.findAll({ ...options, filter });
    }
    async findBySubject(subject, options = {}) {
        const filter = { ...options.filter, subject };
        return await this.findAll({ ...options, filter });
    }
    async findByCourse(course, options = {}) {
        const filter = { ...options.filter, course };
        return await this.findAll({ ...options, filter });
    }
    hasTextIndex() {
        return true;
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=ContentService.js.map