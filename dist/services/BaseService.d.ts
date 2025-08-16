import { Model, Document } from 'mongoose';
import { IBaseService } from '../interfaces/IService';
import { QueryOptions } from '../types';
export declare abstract class BaseService<T extends Document> implements IBaseService<T> {
    protected model: Model<T>;
    constructor(model: Model<T>);
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findAll(options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    protected hasTextIndex(): boolean;
    protected buildQuery(options: QueryOptions): any;
}
//# sourceMappingURL=BaseService.d.ts.map