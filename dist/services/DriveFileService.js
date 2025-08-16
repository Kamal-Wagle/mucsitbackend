"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driveFileService = exports.DriveFileService = void 0;
const DriveFile_1 = require("../models/DriveFile");
const ContentService_1 = require("./ContentService");
const GoogleDriveService_1 = require("./GoogleDriveService");
class DriveFileService extends ContentService_1.ContentService {
    constructor() {
        super(DriveFile_1.DriveFile);
    }
    async createFileRecord(driveFileData, uploadedBy, uploaderName) {
        const fileRecord = await this.create({
            driveFileId: driveFileData.id,
            name: driveFileData.name,
            originalName: driveFileData.name,
            mimeType: driveFileData.mimeType,
            size: parseInt(driveFileData.size) || 0,
            driveUrl: driveFileData.webViewLink,
            webViewLink: driveFileData.webViewLink,
            webContentLink: driveFileData.webContentLink,
            uploadedBy,
            uploaderName,
            department: 'General',
            category: 'documents'
        });
        return fileRecord;
    }
    async findByDriveFileId(driveFileId) {
        return await this.model.findOne({ driveFileId });
    }
    async syncWithDrive(fileId) {
        try {
            const fileRecord = await this.findByDriveFileId(fileId);
            if (!fileRecord)
                return null;
            const driveFile = await GoogleDriveService_1.googleDriveService.getFile(fileId);
            if (!driveFile) {
                await this.model.findByIdAndDelete(fileRecord._id);
                return null;
            }
            const updatedRecord = await this.model.findByIdAndUpdate(fileRecord._id, {
                name: driveFile.name,
                size: parseInt(driveFile.size) || 0,
                webViewLink: driveFile.webViewLink,
                webContentLink: driveFile.webContentLink
            }, { new: true });
            return updatedRecord;
        }
        catch (error) {
            console.error('Error syncing with Google Drive:', error);
            throw new Error('Failed to sync with Google Drive');
        }
    }
    async deleteFileCompletely(id) {
        try {
            const fileRecord = await this.findById(id);
            if (!fileRecord)
                return false;
            const driveDeleted = await GoogleDriveService_1.googleDriveService.deleteFile(fileRecord.driveFileId);
            await this.delete(id);
            return driveDeleted;
        }
        catch (error) {
            console.error('Error deleting file completely:', error);
            return false;
        }
    }
    async findByCategory(category, options = {}) {
        const filter = { ...options.filter, category };
        return await this.findAll({ ...options, filter });
    }
    async findByFileType(fileType, options = {}) {
        let mimeTypePattern;
        switch (fileType.toLowerCase()) {
            case 'image':
                mimeTypePattern = '^image/';
                break;
            case 'video':
                mimeTypePattern = '^video/';
                break;
            case 'audio':
                mimeTypePattern = '^audio/';
                break;
            case 'pdf':
                mimeTypePattern = 'pdf';
                break;
            case 'document':
                mimeTypePattern = '(word|document)';
                break;
            default:
                mimeTypePattern = fileType;
        }
        const filter = {
            ...options.filter,
            mimeType: { $regex: mimeTypePattern, $options: 'i' }
        };
        return await this.findAll({ ...options, filter });
    }
    async getMostDownloaded(limit = 10) {
        return await this.model
            .find({ isPublic: true })
            .sort({ downloads: -1 })
            .limit(limit)
            .populate('uploadedBy', 'firstName lastName fullName');
    }
    async getRecentUploads(limit = 10) {
        return await this.model
            .find({ isPublic: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('uploadedBy', 'firstName lastName fullName');
    }
    async getFilesByUploader(uploaderId, options = {}) {
        return await this.findByAuthor(uploaderId, options);
    }
}
exports.DriveFileService = DriveFileService;
exports.driveFileService = new DriveFileService();
//# sourceMappingURL=DriveFileService.js.map