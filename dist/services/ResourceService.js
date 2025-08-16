"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceService = void 0;
const Resource_1 = require("../models/Resource");
const ContentService_1 = require("./ContentService");
class ResourceService extends ContentService_1.ContentService {
    constructor() {
        super(Resource_1.Resource);
    }
    async findById(id, populateAuthor = false) {
        let query = this.model.findById(id);
        if (populateAuthor) {
            query = query.populate('author', 'firstName lastName fullName');
        }
        return await query;
    }
    async findAll(options = {}) {
        const { populateAuthor = false } = options;
        const result = await super.findAll(options);
        if (populateAuthor) {
            let query = this.model.find(this.buildQuery(options));
            query = query.populate('author', 'firstName lastName fullName');
            const skip = ((options.page || 1) - 1) * (options.limit || 10);
            result.data = await query
                .sort(options.sort || '-createdAt')
                .skip(skip)
                .limit(options.limit || 10);
        }
        return result;
    }
    async findByType(type, options = {}) {
        const filter = { ...options.filter, type };
        return await this.findAll({ ...options, filter });
    }
    async findByCategory(category, options = {}) {
        const filter = { ...options.filter, category };
        return await this.findAll({ ...options, filter });
    }
    async findByTags(tags, options = {}) {
        const filter = { ...options.filter, tags: { $in: tags } };
        return await this.findAll({ ...options, filter });
    }
    async getMostDownloaded(limit = 10) {
        return await this.model
            .find({ isPublic: true })
            .sort({ downloads: -1 })
            .limit(limit)
            .populate('author', 'firstName lastName fullName');
    }
    async getMostViewed(limit = 10) {
        return await this.model
            .find({ isPublic: true })
            .sort({ views: -1 })
            .limit(limit)
            .populate('author', 'firstName lastName fullName');
    }
    async getRecentlyAdded(limit = 10) {
        return await this.model
            .find({ isPublic: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('author', 'firstName lastName fullName');
    }
}
exports.ResourceService = ResourceService;
//# sourceMappingURL=ResourceService.js.map