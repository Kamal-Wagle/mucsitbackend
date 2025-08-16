import { IUser } from '../types';
export declare const generateToken: (userId: string) => string;
export declare const verifyToken: (token: string) => {
    userId: string;
};
export declare const generateTokens: (user: IUser) => {
    accessToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        role: import("../types").UserRole;
        department: string;
        studentId: string | undefined;
        employeeId: string | undefined;
    };
};
//# sourceMappingURL=jwt.d.ts.map