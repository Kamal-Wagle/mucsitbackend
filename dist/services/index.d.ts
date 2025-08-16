export declare class NotesService {
    static findByAuthor(authorId: string, options?: any): Promise<{
        notes: (import("mongoose").Document<unknown, {}, import("../types").INote, {}, {}> & import("../types").INote & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    static incrementViews(noteId: string): Promise<void>;
    static incrementDownloads(noteId: string): Promise<void>;
}
export declare class AssignmentsService {
    static findByInstructor(instructorId: string, options?: any): Promise<{
        assignments: (import("mongoose").Document<unknown, {}, import("../types").IAssignment, {}, {}> & import("../types").IAssignment & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    static deactivateExpired(): Promise<number>;
}
export declare const assignmentService: typeof AssignmentsService;
export declare class ResourcesService {
    static findByAuthor(authorId: string, options?: any): Promise<{
        resources: (import("mongoose").Document<unknown, {}, import("../types").IResource, {}, {}> & import("../types").IResource & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    static incrementViews(resourceId: string): Promise<void>;
    static incrementDownloads(resourceId: string): Promise<void>;
}
export declare class DriveFilesService {
    static findByUploader(uploaderId: string, options?: any): Promise<{
        files: (import("mongoose").Document<unknown, {}, import("../models/DriveFile").IDriveFile, {}, {}> & import("../models/DriveFile").IDriveFile & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    static incrementViews(fileId: string): Promise<void>;
    static incrementDownloads(fileId: string): Promise<void>;
}
export declare class UsersService {
    static findByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    static findByStudentId(studentId: string): Promise<(import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    static findByEmployeeId(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    static findByCredentials(email: string, password: string): Promise<(import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    static create(userData: any): Promise<import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    static update(userId: string, updateData: any): Promise<(import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    static updatePassword(userId: string, newPassword: string): Promise<(import("mongoose").Document<unknown, {}, import("../types").IUser, {}, {}> & import("../types").IUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    static updateLastLogin(userId: string): Promise<void>;
    static deactivateUser(userId: string): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map