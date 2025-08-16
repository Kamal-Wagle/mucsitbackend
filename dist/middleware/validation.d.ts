import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const createNoteSchema: Joi.ObjectSchema<any>;
export declare const updateNoteSchema: Joi.ObjectSchema<any>;
export declare const createAssignmentSchema: Joi.ObjectSchema<any>;
export declare const updateAssignmentSchema: Joi.ObjectSchema<any>;
export declare const createResourceSchema: Joi.ObjectSchema<any>;
export declare const updateResourceSchema: Joi.ObjectSchema<any>;
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const driveValidationSchemas: {
    createFolder: Joi.ObjectSchema<any>;
    shareFile: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map