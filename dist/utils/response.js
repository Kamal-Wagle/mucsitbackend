"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAsync = exports.createPaginatedResponse = exports.createApiResponse = void 0;
const createApiResponse = (success, message, data, error) => {
    const response = {
        success,
        message
    };
    if (data !== undefined) {
        response.data = data;
    }
    if (error !== undefined) {
        response.error = error;
    }
    return response;
};
exports.createApiResponse = createApiResponse;
const createPaginatedResponse = (success, message, data, page, limit, total) => {
    return {
        success,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};
exports.createPaginatedResponse = createPaginatedResponse;
const handleAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.handleAsync = handleAsync;
//# sourceMappingURL=response.js.map