import { IUser } from '../types';
import { BaseService } from './BaseService';
import { IUserService } from '../interfaces/IService';
export declare class UserService extends BaseService<IUser> implements IUserService {
    constructor();
    findByEmail(email: string): Promise<IUser | null>;
    findByCredentials(email: string, password: string): Promise<IUser | null>;
    updatePassword(id: string, newPassword: string): Promise<boolean>;
    updateLastLogin(id: string): Promise<void>;
    findByStudentId(studentId: string): Promise<IUser | null>;
    findByEmployeeId(employeeId: string): Promise<IUser | null>;
    deactivateUser(id: string): Promise<boolean>;
}
//# sourceMappingURL=UserService.d.ts.map