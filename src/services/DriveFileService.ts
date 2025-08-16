import { DriveFile, IDriveFile } from '../models/DriveFile';
import { ContentService } from './ContentService';
import { googleDriveService } from './GoogleDriveService';

export class DriveFileService extends ContentService<IDriveFile> {
  constructor() {
    super(DriveFile);
  }

  async createFileRecord(driveFileData: any, uploadedBy: string, uploaderName: string): Promise<IDriveFile> {
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
      department: 'General', // Should be passed from request
      category: 'documents' // Should be determined from file type
    });

    return fileRecord;
  }

  async findByDriveFileId(driveFileId: string): Promise<IDriveFile | null> {
    return await this.model.findOne({ driveFileId });
  }

  async syncWithDrive(fileId: string): Promise<IDriveFile | null> {
    try {
      const fileRecord = await this.findByDriveFileId(fileId);
      if (!fileRecord) return null;

      const driveFile = await googleDriveService.getFile(fileId);
      if (!driveFile) {
        // File deleted from Drive, remove from database
        await this.model.findByIdAndDelete(fileRecord._id);
        return null;
      }

      // Update file record with latest Drive data
      const updatedRecord = await this.model.findByIdAndUpdate(
        fileRecord._id,
        {
          name: driveFile.name,
          size: parseInt(driveFile.size) || 0,
          webViewLink: driveFile.webViewLink,
          webContentLink: driveFile.webContentLink
        },
        { new: true }
      );

      return updatedRecord;
    } catch (error) {
      console.error('Error syncing with Google Drive:', error);
      throw new Error('Failed to sync with Google Drive');
    }
  }

  async deleteFileCompletely(id: string): Promise<boolean> {
    try {
      const fileRecord = await this.findById(id);
      if (!fileRecord) return false;

      // Delete from Google Drive
      const driveDeleted = await googleDriveService.deleteFile(fileRecord.driveFileId);
      
      // Delete from database regardless of Drive deletion result
      await this.delete(id);

      return driveDeleted;
    } catch (error) {
      console.error('Error deleting file completely:', error);
      return false;
    }
  }

  async findByCategory(category: string, options: any = {}): Promise<{ data: IDriveFile[]; total: number }> {
    const filter = { ...options.filter, category };
    return await this.findAll({ ...options, filter });
  }

  async findByFileType(fileType: string, options: any = {}): Promise<{ data: IDriveFile[]; total: number }> {
    let mimeTypePattern: string;
    
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

  async getMostDownloaded(limit: number = 10): Promise<IDriveFile[]> {
    return await this.model
      .find({ isPublic: true })
      .sort({ downloads: -1 })
      .limit(limit)
      .populate('uploadedBy', 'firstName lastName fullName');
  }

  async getRecentUploads(limit: number = 10): Promise<IDriveFile[]> {
    return await this.model
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('uploadedBy', 'firstName lastName fullName');
  }

  async getFilesByUploader(uploaderId: string, options: any = {}): Promise<{ data: IDriveFile[]; total: number }> {
    return await this.findByAuthor(uploaderId, options);
  }
}

export const driveFileService = new DriveFileService();