"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleDriveService = exports.GoogleDriveService = void 0;
const stream_1 = require("stream");
const googleDrive_1 = require("../config/googleDrive");
const environment_1 = require("../config/environment");
class GoogleDriveService {
    constructor() {
        this.drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        this.universityFolderId = environment_1.config.googleDrive.universityFolderId;
    }
    async uploadFile(fileBuffer, options) {
        try {
            const fileMetadata = {
                name: options.name,
                parents: options.parents || [this.universityFolderId],
                description: options.description || 'University document'
            };
            const media = {
                mimeType: options.mimeType,
                body: stream_1.Readable.from(fileBuffer)
            };
            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
            });
            await this.drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
            return this.formatFileResponse(response.data);
        }
        catch (error) {
            console.error('Error uploading file to Google Drive:', error);
            throw new Error('Failed to upload file to Google Drive');
        }
    }
    async getFile(fileId) {
        try {
            const response = await this.drive.files.get({
                fileId,
                fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
            });
            return this.formatFileResponse(response.data);
        }
        catch (error) {
            if (error.code === 404) {
                return null;
            }
            console.error('Error getting file from Google Drive:', error);
            throw new Error('Failed to retrieve file from Google Drive');
        }
    }
    async downloadFile(fileId) {
        try {
            const response = await this.drive.files.get({
                fileId,
                alt: 'media'
            }, { responseType: 'stream' });
            return new Promise((resolve, reject) => {
                const chunks = [];
                response.data.on('data', (chunk) => chunks.push(chunk));
                response.data.on('end', () => resolve(Buffer.concat(chunks)));
                response.data.on('error', reject);
            });
        }
        catch (error) {
            console.error('Error downloading file from Google Drive:', error);
            throw new Error('Failed to download file from Google Drive');
        }
    }
    async updateFile(fileId, fileBuffer, metadata) {
        try {
            const updateData = {};
            if (metadata) {
                updateData.requestBody = {
                    name: metadata.name,
                    description: metadata.description
                };
            }
            if (fileBuffer) {
                updateData.media = {
                    mimeType: metadata?.mimeType,
                    body: stream_1.Readable.from(fileBuffer)
                };
            }
            updateData.fileId = fileId;
            updateData.fields = 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents';
            const response = await this.drive.files.update(updateData);
            return this.formatFileResponse(response.data);
        }
        catch (error) {
            console.error('Error updating file in Google Drive:', error);
            throw new Error('Failed to update file in Google Drive');
        }
    }
    async deleteFile(fileId) {
        try {
            await this.drive.files.delete({ fileId });
            return true;
        }
        catch (error) {
            console.error('Error deleting file from Google Drive:', error);
            return false;
        }
    }
    async listFiles(options = {}) {
        try {
            const { pageSize = 10, pageToken, query = `'${this.universityFolderId}' in parents and trashed=false`, orderBy = 'modifiedTime desc' } = options;
            const response = await this.drive.files.list({
                pageSize,
                pageToken,
                q: query,
                orderBy,
                fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents)'
            });
            return {
                files: response.data.files.map(this.formatFileResponse),
                nextPageToken: response.data.nextPageToken
            };
        }
        catch (error) {
            console.error('Error listing files from Google Drive:', error);
            throw new Error('Failed to list files from Google Drive');
        }
    }
    async createFolder(name, parentId) {
        try {
            const fileMetadata = {
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId || this.universityFolderId]
            };
            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id,name,mimeType,createdTime,modifiedTime,webViewLink,parents'
            });
            return this.formatFileResponse(response.data);
        }
        catch (error) {
            console.error('Error creating folder in Google Drive:', error);
            throw new Error('Failed to create folder in Google Drive');
        }
    }
    async searchFiles(searchTerm, options = {}) {
        try {
            const { pageSize = 50, mimeType, parentId = this.universityFolderId } = options;
            let query = `'${parentId}' in parents and trashed=false and name contains '${searchTerm}'`;
            if (mimeType) {
                query += ` and mimeType='${mimeType}'`;
            }
            const response = await this.drive.files.list({
                pageSize,
                q: query,
                orderBy: 'relevance',
                fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents)'
            });
            return response.data.files.map(this.formatFileResponse);
        }
        catch (error) {
            console.error('Error searching files in Google Drive:', error);
            throw new Error('Failed to search files in Google Drive');
        }
    }
    formatFileResponse(file) {
        return {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size || '0',
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            webViewLink: file.webViewLink,
            webContentLink: file.webContentLink,
            parents: file.parents
        };
    }
    async getFilePermissions(fileId) {
        try {
            const response = await this.drive.permissions.list({ fileId });
            return response.data.permissions;
        }
        catch (error) {
            console.error('Error getting file permissions:', error);
            throw new Error('Failed to get file permissions');
        }
    }
    async shareFile(fileId, email, role = 'reader') {
        try {
            await this.drive.permissions.create({
                fileId,
                requestBody: {
                    role,
                    type: 'user',
                    emailAddress: email
                }
            });
            return true;
        }
        catch (error) {
            console.error('Error sharing file:', error);
            return false;
        }
    }
}
exports.GoogleDriveService = GoogleDriveService;
exports.googleDriveService = new GoogleDriveService();
//# sourceMappingURL=GoogleDriveService.js.map