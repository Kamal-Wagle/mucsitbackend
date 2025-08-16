import { Document } from 'mongoose';
import { Request } from 'express';
export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    role: UserRole;
    studentId?: string;
    employeeId?: string;
    department: string;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface INote extends Document {
    _id: string;
    title: string;
    content: string;
    subject: string;
    course: string;
    department: string;
    author: any;
    authorName: string;
    tags: string[];
    attachments: IAttachment[];
    isPublic: boolean;
    downloads: number;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAssignment extends Document {
    _id: string;
    title: string;
    description: string;
    subject: string;
    course: string;
    department: string;
    instructor: any;
    instructorName: string;
    dueDate: Date;
    maxMarks: number;
    attachments: IAttachment[];
    instructions: string[];
    submissionFormat: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IResource extends Document {
    _id: string;
    title: string;
    description: string;
    type: ResourceType;
    category: string;
    subject: string;
    course: string;
    department: string;
    author: any;
    authorName: string;
    fileUrl?: string;
    externalUrl?: string;
    attachments: IAttachment[];
    tags: string[];
    isPublic: boolean;
    downloads: number;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAttachment {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: Date;
}
export declare enum UserRole {
    STUDENT = "student",
    INSTRUCTOR = "instructor",
    ADMIN = "admin"
}
export declare enum ResourceType {
    DOCUMENT = "document",
    VIDEO = "video",
    AUDIO = "audio",
    LINK = "link",
    PRESENTATION = "presentation",
    SPREADSHEET = "spreadsheet"
}
export interface AuthRequest extends Request {
    user?: IUser;
    resource?: any;
    file?: any;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface QueryOptions {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    filter?: Record<string, any>;
    populateAuthor?: boolean;
}
export interface DriveFileData {
    id: string;
    name: string;
    mimeType: string;
    size: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink: string;
    parents?: string[];
}
//# sourceMappingURL=index.d.ts.map