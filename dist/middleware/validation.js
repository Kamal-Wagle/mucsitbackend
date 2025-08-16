"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driveValidationSchemas = exports.paginationSchema = exports.updateResourceSchema = exports.createResourceSchema = exports.updateAssignmentSchema = exports.createAssignmentSchema = exports.updateNoteSchema = exports.createNoteSchema = exports.loginSchema = exports.registerSchema = exports.validateQuery = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const response_1 = require("../utils/response");
const types_1 = require("../types");
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            res.status(400).json((0, response_1.createApiResponse)(false, 'Validation error', null, errors));
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            res.status(400).json((0, response_1.createApiResponse)(false, 'Query validation error', null, errors));
            return;
        }
        next();
    };
};
exports.validateQuery = validateQuery;
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        'any.required': 'Password is required'
    }),
    firstName: joi_1.default.string().trim().max(50).required().messages({
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
    }),
    lastName: joi_1.default.string().trim().max(50).required().messages({
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
    }),
    role: joi_1.default.string().valid(...Object.values(types_1.UserRole)).required(),
    studentId: joi_1.default.string().trim().when('role', {
        is: types_1.UserRole.STUDENT,
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional()
    }),
    employeeId: joi_1.default.string().trim().when('role', {
        is: joi_1.default.valid(types_1.UserRole.INSTRUCTOR, types_1.UserRole.ADMIN),
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional()
    }),
    department: joi_1.default.string().trim().required().messages({
        'any.required': 'Department is required'
    })
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.createNoteSchema = joi_1.default.object({
    title: joi_1.default.string().trim().max(200).required(),
    content: joi_1.default.string().max(50000).required(),
    subject: joi_1.default.string().trim().required(),
    course: joi_1.default.string().trim().required(),
    department: joi_1.default.string().trim().required(),
    tags: joi_1.default.array().items(joi_1.default.string().trim().lowercase()).optional(),
    isPublic: joi_1.default.boolean().optional()
});
exports.updateNoteSchema = joi_1.default.object({
    title: joi_1.default.string().trim().max(200).optional(),
    content: joi_1.default.string().max(50000).optional(),
    subject: joi_1.default.string().trim().optional(),
    course: joi_1.default.string().trim().optional(),
    department: joi_1.default.string().trim().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().trim().lowercase()).optional(),
    isPublic: joi_1.default.boolean().optional()
});
exports.createAssignmentSchema = joi_1.default.object({
    title: joi_1.default.string().trim().max(200).required(),
    description: joi_1.default.string().max(10000).required(),
    subject: joi_1.default.string().trim().required(),
    course: joi_1.default.string().trim().required(),
    department: joi_1.default.string().trim().required(),
    dueDate: joi_1.default.date().greater('now').required().messages({
        'date.greater': 'Due date must be in the future'
    }),
    maxMarks: joi_1.default.number().min(1).required(),
    instructions: joi_1.default.array().items(joi_1.default.string().trim()).optional(),
    submissionFormat: joi_1.default.array().items(joi_1.default.string().valid('pdf', 'doc', 'docx', 'txt', 'zip', 'ppt', 'pptx')).optional(),
    isActive: joi_1.default.boolean().optional()
});
exports.updateAssignmentSchema = joi_1.default.object({
    title: joi_1.default.string().trim().max(200).optional(),
    description: joi_1.default.string().max(10000).optional(),
    subject: joi_1.default.string().trim().optional(),
    course: joi_1.default.string().trim().optional(),
    department: joi_1.default.string().trim().optional(),
    dueDate: joi_1.default.date().greater('now').optional(),
    maxMarks: joi_1.default.number().min(1).optional(),
    instructions: joi_1.default.array().items(joi_1.default.string().trim()).optional(),
    submissionFormat: joi_1.default.array().items(joi_1.default.string().valid('pdf', 'doc', 'docx', 'txt', 'zip', 'ppt', 'pptx')).optional(),
    isActive: joi_1.default.boolean().optional()
});
exports.createResourceSchema = joi_1.default.object({
    title: joi_1.default.string().trim().max(200).required(),
    description: joi_1.default.string().max(5000).required(),
    type: joi_1.default.string().valid(...Object.values(types_1.ResourceType)).required(),
    category: joi_1.default.string().trim().required(),
    subject: joi_1.default.string().trim().required(),
    course: joi_1.default.string().trim().required(),
    department: joi_1.default.string().trim().required(),
    externalUrl: joi_1.default.string().uri().when('type', {
        is: types_1.ResourceType.LINK,
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional()
    }),
    tags: joi_1.default.array().items(joi_1.default.string().trim().lowercase()).optional(),
    isPublic: joi_1.default.boolean().optional()
});
exports.updateResourceSchema = joi_1.default.object({
    title: joi_1.default.string().trim().max(200).optional(),
    description: joi_1.default.string().max(5000).optional(),
    type: joi_1.default.string().valid(...Object.values(types_1.ResourceType)).optional(),
    category: joi_1.default.string().trim().optional(),
    subject: joi_1.default.string().trim().optional(),
    course: joi_1.default.string().trim().optional(),
    department: joi_1.default.string().trim().optional(),
    externalUrl: joi_1.default.string().uri().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().trim().lowercase()).optional(),
    isPublic: joi_1.default.boolean().optional()
});
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sort: joi_1.default.string().optional(),
    search: joi_1.default.string().trim().optional(),
    department: joi_1.default.string().trim().optional(),
    subject: joi_1.default.string().trim().optional(),
    course: joi_1.default.string().trim().optional(),
    author: joi_1.default.string().optional(),
    isPublic: joi_1.default.boolean().optional()
});
exports.driveValidationSchemas = {
    createFolder: joi_1.default.object({
        name: joi_1.default.string().trim().max(100).required().messages({
            'any.required': 'Folder name is required',
            'string.max': 'Folder name cannot exceed 100 characters'
        }),
        parentId: joi_1.default.string().optional()
    }),
    shareFile: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        role: joi_1.default.string().valid('reader', 'writer', 'commenter').default('reader')
    })
};
//# sourceMappingURL=validation.js.map