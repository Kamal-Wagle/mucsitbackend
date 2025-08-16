import { IAssignment } from '../types';
import { ContentService } from './ContentService';
export declare class AssignmentService extends ContentService<IAssignment> {
    constructor();
    findById(id: string, populateInstructor?: boolean): Promise<IAssignment | null>;
    findAll(options?: any): Promise<{
        data: IAssignment[];
        total: number;
    }>;
    findByInstructor(instructorId: string, options?: any): Promise<{
        data: IAssignment[];
        total: number;
    }>;
    findActive(options?: any): Promise<{
        data: IAssignment[];
        total: number;
    }>;
    findExpired(options?: any): Promise<{
        data: IAssignment[];
        total: number;
    }>;
    findUpcoming(days?: number, options?: any): Promise<{
        data: IAssignment[];
        total: number;
    }>;
    deactivateExpired(): Promise<number>;
}
//# sourceMappingURL=AssignmentService.d.ts.map