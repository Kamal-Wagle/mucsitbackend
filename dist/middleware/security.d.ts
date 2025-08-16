import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
export declare const globalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const corsOptions: cors.CorsOptions;
export declare const helmetConfig: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const compressionConfig: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const mongoSanitizeConfig: import("express").Handler;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map