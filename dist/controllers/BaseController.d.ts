import { Request } from 'express';
import { AuthRequest, QueryOptions } from '../types';
import { IBaseService } from '../interfaces/IService';
export declare abstract class BaseController<T> {
    protected service: IBaseService<T>;
    constructor(service: IBaseService<T>);
    create: (req: any, res: any, next: any) => void;
    getAll: (req: any, res: any, next: any) => void;
    getById: (req: any, res: any, next: any) => void;
    update: (req: any, res: any, next: any) => void;
    delete: (req: any, res: any, next: any) => void;
    protected buildQueryOptions(req: Request): QueryOptions;
    protected buildFilters(queryParams: any): Record<string, any>;
    protected prepareCreateData(req: AuthRequest): Partial<T>;
    protected prepareUpdateData(req: AuthRequest): Partial<T>;
    protected abstract getResourceName(): string;
}
//# sourceMappingURL=BaseController.d.ts.map