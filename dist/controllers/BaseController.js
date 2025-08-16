"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const response_1 = require("../utils/response");
class BaseController {
    constructor(service) {
        this.create = (0, response_1.handleAsync)(async (req, res) => {
            const data = this.prepareCreateData(req);
            const item = await this.service.create(data);
            return res.status(201).json((0, response_1.createApiResponse)(true, `${this.getResourceName()} created successfully`, item));
        });
        this.getAll = (0, response_1.handleAsync)(async (req, res) => {
            const options = this.buildQueryOptions(req);
            const { data, total } = await this.service.findAll(options);
            return res.json((0, response_1.createPaginatedResponse)(true, `${this.getResourceName()}s retrieved successfully`, data, options.page || 1, options.limit || 10, total));
        });
        this.getById = (0, response_1.handleAsync)(async (req, res) => {
            const id = req.params.id;
            const item = await this.service.findById(id);
            if (!item) {
                return res.status(404).json((0, response_1.createApiResponse)(false, `${this.getResourceName()} not found`));
            }
            return res.json((0, response_1.createApiResponse)(true, `${this.getResourceName()} retrieved successfully`, item));
        });
        this.update = (0, response_1.handleAsync)(async (req, res) => {
            const id = req.params.id;
            const data = this.prepareUpdateData(req);
            const item = await this.service.update(id, data);
            if (!item) {
                return res.status(404).json((0, response_1.createApiResponse)(false, `${this.getResourceName()} not found`));
            }
            return res.json((0, response_1.createApiResponse)(true, `${this.getResourceName()} updated successfully`, item));
        });
        this.delete = (0, response_1.handleAsync)(async (req, res) => {
            const id = req.params.id;
            const deleted = await this.service.delete(id);
            if (!deleted) {
                return res.status(404).json((0, response_1.createApiResponse)(false, `${this.getResourceName()} not found`));
            }
            return res.json((0, response_1.createApiResponse)(true, `${this.getResourceName()} deleted successfully`));
        });
        this.service = service;
    }
    buildQueryOptions(req) {
        const { page = 1, limit = 10, sort = '-createdAt', search, ...filters } = req.query;
        return {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            search,
            filter: this.buildFilters(filters)
        };
    }
    buildFilters(queryParams) {
        const filters = {};
        if (queryParams.department)
            filters.department = queryParams.department;
        if (queryParams.subject)
            filters.subject = queryParams.subject;
        if (queryParams.course)
            filters.course = queryParams.course;
        if (queryParams.isPublic !== undefined)
            filters.isPublic = queryParams.isPublic === 'true';
        return filters;
    }
    prepareCreateData(req) {
        return req.body;
    }
    prepareUpdateData(req) {
        return req.body;
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map