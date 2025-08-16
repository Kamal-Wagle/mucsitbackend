import { INote } from '../types';
import { ContentService } from './ContentService';
export declare class NoteService extends ContentService<INote> {
    constructor();
    findById(id: string, populateAuthor?: boolean): Promise<INote | null>;
    getExcerpt(id: string): Promise<string | null>;
    findByTags(tags: string[], options?: any): Promise<{
        data: INote[];
        total: number;
    }>;
}
//# sourceMappingURL=NoteService.d.ts.map