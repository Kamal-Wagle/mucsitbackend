import { IDriveFile } from '../models/DriveFile';
import { ContentService } from './ContentService';
export declare class DriveFileService extends ContentService<IDriveFile> {
    constructor();
    createFileRecord(driveFileData: any, uploadedBy: string, uploaderName: string): Promise<IDriveFile>;
    findByDriveFileId(driveFileId: string): Promise<IDriveFile | null>;
    syncWithDrive(fileId: string): Promise<IDriveFile | null>;
    deleteFileCompletely(id: string): Promise<boolean>;
    findByCategory(category: string, options?: any): Promise<{
        data: IDriveFile[];
        total: number;
    }>;
    findByFileType(fileType: string, options?: any): Promise<{
        data: IDriveFile[];
        total: number;
    }>;
    getMostDownloaded(limit?: number): Promise<IDriveFile[]>;
    getRecentUploads(limit?: number): Promise<IDriveFile[]>;
    getFilesByUploader(uploaderId: string, options?: any): Promise<{
        data: IDriveFile[];
        total: number;
    }>;
}
export declare const driveFileService: DriveFileService;
//# sourceMappingURL=DriveFileService.d.ts.map