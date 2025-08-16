import mongoose from 'mongoose';
export interface IDriveFile extends mongoose.Document {
    _id: string;
    driveFileId: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    driveUrl: string;
    webViewLink: string;
    webContentLink: string;
    uploadedBy: any;
    uploaderName: string;
    department: string;
    course?: string;
    subject?: string;
    category: string;
    tags: string[];
    isPublic: boolean;
    downloads: number;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DriveFile: mongoose.Model<IDriveFile, {}, {}, {}, mongoose.Document<unknown, {}, IDriveFile, {}, {}> & IDriveFile & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=DriveFile.d.ts.map