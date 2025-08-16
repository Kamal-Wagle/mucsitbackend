import { IResource, ResourceType } from '../types';
import { ContentService } from './ContentService';
export declare class ResourceService extends ContentService<IResource> {
    constructor();
    findById(id: string, populateAuthor?: boolean): Promise<IResource | null>;
    findAll(options?: any): Promise<{
        data: IResource[];
        total: number;
    }>;
    findByType(type: ResourceType, options?: any): Promise<{
        data: IResource[];
        total: number;
    }>;
    findByCategory(category: string, options?: any): Promise<{
        data: IResource[];
        total: number;
    }>;
    findByTags(tags: string[], options?: any): Promise<{
        data: IResource[];
        total: number;
    }>;
    getMostDownloaded(limit?: number): Promise<IResource[]>;
    getMostViewed(limit?: number): Promise<IResource[]>;
    getRecentlyAdded(limit?: number): Promise<IResource[]>;
}
//# sourceMappingURL=ResourceService.d.ts.map