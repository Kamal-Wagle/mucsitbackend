"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const document = new this.model(data);
        return await document.save();
    }
    async findById(id) {
        return await this.model.findById(id);
    }
    async findAll(options = {}) {
        const { page = 1, limit = 10, sort = '-createdAt', search, filter = {} } = options;
        let query = this.model.find(filter);
        if (search && this.hasTextIndex()) {
            query = query.find({ $text: { $search: search } });
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            query.sort(sort).skip(skip).limit(limit),
            this.model.countDocuments(search && this.hasTextIndex()
                ? { ...filter, $text: { $search: search } }
                : filter)
        ]);
        return { data, total };
    }
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }
    hasTextIndex() {
        return false;
    }
    buildQuery(options) {
        const query = {};
        if (options.filter) {
            Object.assign(query, options.filter);
        }
        return query;
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map