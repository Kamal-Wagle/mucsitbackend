import { Readable } from 'stream';
import { googleDriveConfig } from '../config/googleDrive';
import { config } from '../config/environment';

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

export class GoogleDriveService {
  private drive: any;
  private universityFolderId: string;

  constructor() {
    this.drive = googleDriveConfig.getDriveInstance();
    this.universityFolderId = config.googleDrive.universityFolderId;
  }

  async uploadFile(fileBuffer: Buffer, options: UploadOptions): Promise<DriveFile> {
    try {
      const fileMetadata = {
        name: options.name,
        parents: options.parents || [this.universityFolderId],
        description: options.description || 'University document'
      };

      const media = {
        mimeType: options.mimeType,
        body: Readable.from(fileBuffer)
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
      });

      // Make file publicly readable
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return this.formatFileResponse(response.data);
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  async getFile(fileId: string): Promise<DriveFile | null> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
      });

      return this.formatFileResponse(response.data);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      console.error('Error getting file from Google Drive:', error);
      throw new Error('Failed to retrieve file from Google Drive');
    }
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.data.on('end', () => resolve(Buffer.concat(chunks)));
        response.data.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading file from Google Drive:', error);
      throw new Error('Failed to download file from Google Drive');
    }
  }

  async updateFile(fileId: string, fileBuffer?: Buffer, metadata?: Partial<UploadOptions>): Promise<DriveFile> {
    try {
      const updateData: any = {};

      if (metadata) {
        updateData.requestBody = {
          name: metadata.name,
          description: metadata.description
        };
      }

      if (fileBuffer) {
        updateData.media = {
          mimeType: metadata?.mimeType,
          body: Readable.from(fileBuffer)
        };
      }

      updateData.fileId = fileId;
      updateData.fields = 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents';

      const response = await this.drive.files.update(updateData);
      return this.formatFileResponse(response.data);
    } catch (error) {
      console.error('Error updating file in Google Drive:', error);
      throw new Error('Failed to update file in Google Drive');
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      return false;
    }
  }

  async listFiles(options: {
    pageSize?: number;
    pageToken?: string;
    query?: string;
    orderBy?: string;
  } = {}): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    try {
      const {
        pageSize = 10,
        pageToken,
        query = `'${this.universityFolderId}' in parents and trashed=false`,
        orderBy = 'modifiedTime desc'
      } = options;

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
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      throw new Error('Failed to list files from Google Drive');
    }
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
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
    } catch (error) {
      console.error('Error creating folder in Google Drive:', error);
      throw new Error('Failed to create folder in Google Drive');
    }
  }

  async searchFiles(searchTerm: string, options: {
    pageSize?: number;
    mimeType?: string;
    parentId?: string;
  } = {}): Promise<DriveFile[]> {
    try {
      const {
        pageSize = 50,
        mimeType,
        parentId = this.universityFolderId
      } = options;

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
    } catch (error) {
      console.error('Error searching files in Google Drive:', error);
      throw new Error('Failed to search files in Google Drive');
    }
  }

  private formatFileResponse(file: any): DriveFile {
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

  async getFilePermissions(fileId: string): Promise<any[]> {
    try {
      const response = await this.drive.permissions.list({ fileId });
      return response.data.permissions;
    } catch (error) {
      console.error('Error getting file permissions:', error);
      throw new Error('Failed to get file permissions');
    }
  }

  async shareFile(fileId: string, email: string, role: 'reader' | 'writer' | 'commenter' = 'reader'): Promise<boolean> {
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
    } catch (error) {
      console.error('Error sharing file:', error);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();