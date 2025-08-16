export interface DriveFile {
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
export interface UploadOptions {
    name: string;
    mimeType: string;
    parents?: string[];
    description?: string;
}
export declare class GoogleDriveService {
    private drive;
    private universityFolderId;
    constructor();
    uploadFile(fileBuffer: Buffer, options: UploadOptions): Promise<DriveFile>;
    getFile(fileId: string): Promise<DriveFile | null>;
    downloadFile(fileId: string): Promise<Buffer>;
    updateFile(fileId: string, fileBuffer?: Buffer, metadata?: Partial<UploadOptions>): Promise<DriveFile>;
    deleteFile(fileId: string): Promise<boolean>;
    listFiles(options?: {
        pageSize?: number;
        pageToken?: string;
        query?: string;
        orderBy?: string;
    }): Promise<{
        files: DriveFile[];
        nextPageToken?: string;
    }>;
    createFolder(name: string, parentId?: string): Promise<DriveFile>;
    searchFiles(searchTerm: string, options?: {
        pageSize?: number;
        mimeType?: string;
        parentId?: string;
    }): Promise<DriveFile[]>;
    private formatFileResponse;
    getFilePermissions(fileId: string): Promise<any[]>;
    shareFile(fileId: string, email: string, role?: 'reader' | 'writer' | 'commenter'): Promise<boolean>;
}
export declare const googleDriveService: GoogleDriveService;
//# sourceMappingURL=GoogleDriveService.d.ts.map