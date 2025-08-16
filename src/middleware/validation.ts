import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createApiResponse } from '../utils/response';
import { UserRole, ResourceType } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      res.status(400).json(createApiResponse(false, 'Validation error', null, errors));
      return;
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      res.status(400).json(createApiResponse(false, 'Query validation error', null, errors));
      return;
    }
    
    next();
  };
};

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().trim().max(50).required().messages({
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().trim().max(50).required().messages({
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  role: Joi.string().valid(...Object.values(UserRole)).required(),
  studentId: Joi.string().trim().when('role', {
    is: UserRole.STUDENT,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  employeeId: Joi.string().trim().when('role', {
    is: Joi.valid(UserRole.INSTRUCTOR, UserRole.ADMIN),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  department: Joi.string().trim().required().messages({
    'any.required': 'Department is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Note validation schemas
export const createNoteSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  content: Joi.string().max(50000).required(),
  subject: Joi.string().trim().required(),
  course: Joi.string().trim().required(),
  department: Joi.string().trim().required(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isPublic: Joi.boolean().optional()
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  content: Joi.string().max(50000).optional(),
  subject: Joi.string().trim().optional(),
  course: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isPublic: Joi.boolean().optional()
});

// Assignment validation schemas
export const createAssignmentSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(10000).required(),
  subject: Joi.string().trim().required(),
  course: Joi.string().trim().required(),
  department: Joi.string().trim().required(),
  dueDate: Joi.date().greater('now').required().messages({
    'date.greater': 'Due date must be in the future'
  }),
  maxMarks: Joi.number().min(1).required(),
  instructions: Joi.array().items(Joi.string().trim()).optional(),
  submissionFormat: Joi.array().items(Joi.string().valid('pdf', 'doc', 'docx', 'txt', 'zip', 'ppt', 'pptx')).optional(),
  isActive: Joi.boolean().optional()
});

export const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().max(10000).optional(),
  subject: Joi.string().trim().optional(),
  course: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  dueDate: Joi.date().greater('now').optional(),
  maxMarks: Joi.number().min(1).optional(),
  instructions: Joi.array().items(Joi.string().trim()).optional(),
  submissionFormat: Joi.array().items(Joi.string().valid('pdf', 'doc', 'docx', 'txt', 'zip', 'ppt', 'pptx')).optional(),
  isActive: Joi.boolean().optional()
});

// Resource validation schemas
export const createResourceSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(5000).required(),
  type: Joi.string().valid(...Object.values(ResourceType)).required(),
  category: Joi.string().trim().required(),
  subject: Joi.string().trim().required(),
  course: Joi.string().trim().required(),
  department: Joi.string().trim().required(),
  externalUrl: Joi.string().uri().when('type', {
    is: ResourceType.LINK,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isPublic: Joi.boolean().optional()
});

export const updateResourceSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().max(5000).optional(),
  type: Joi.string().valid(...Object.values(ResourceType)).optional(),
  category: Joi.string().trim().optional(),
  subject: Joi.string().trim().optional(),
  course: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  externalUrl: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isPublic: Joi.boolean().optional()
});

// Query validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
  search: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  subject: Joi.string().trim().optional(),
  course: Joi.string().trim().optional(),
  author: Joi.string().optional(),
  isPublic: Joi.boolean().optional()
});

// Google Drive validation schemas
export const driveValidationSchemas = {
  createFolder: Joi.object({
    name: Joi.string().trim().max(100).required().messages({
      'any.required': 'Folder name is required',
      'string.max': 'Folder name cannot exceed 100 characters'
    }),
    parentId: Joi.string().optional()
  }),

  shareFile: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    role: Joi.string().valid('reader', 'writer', 'commenter').default('reader')
  })
};