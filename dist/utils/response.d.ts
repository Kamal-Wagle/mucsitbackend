import { ApiResponse } from '../types';
export declare const createApiResponse: <T = any>(success: boolean, message: string, data?: T, error?: any) => ApiResponse<T>;
export declare const createPaginatedResponse: <T = any>(success: boolean, message: string, data: T[], page: number, limit: number, total: number) => ApiResponse<T[]>;
export declare const handleAsync: (fn: Function) => (req: any, res: any, next: any) => void;
//# sourceMappingURL=response.d.ts.map