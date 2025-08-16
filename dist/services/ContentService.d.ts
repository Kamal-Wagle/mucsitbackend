import { Document } from 'mongoose';
import { BaseService } from './BaseService';
import { IContentService } from '../interfaces/IService';
import { QueryOptions } from '../types';
export declare abstract class ContentService<T extends Document> extends BaseService<T> implements IContentService {
    findByAuthor(authorId: string, options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    incrementViews(id: string): Promise<void>;
    incrementDownloads(id: string): Promise<void>;
    search(query: string, options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    findPublic(options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    findByDepartment(department: string, options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    findBySubject(subject: string, options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    findByCourse(course: string, options?: QueryOptions): Promise<{
        data: T[];
        total: number;
    }>;
    protected hasTextIndex(): boolean;
}
//# sourceMappingURL=ContentService.d.ts.map