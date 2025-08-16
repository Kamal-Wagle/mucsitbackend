import { Response } from 'express';
import { driveFileService } from '../services/DriveFileService';
import { googleDriveService } from '../services/GoogleDriveService';
import { BaseController } from './BaseController';
import { AuthRequest } from '../types';
import { createApiResponse, createPaginatedResponse, handleAsync } from '../utils/response';

class DriveFileController extends BaseController<any> {
  constructor() {
    super(driveFileService);
  }

  protected getResourceName(): string {
    return 'DriveFile';
  }

  protected prepareCreateData(req: AuthRequest): any {
    return {
      ...req.body,
      uploadedBy: req.user?._id,
      uploaderName: req.user?.fullName
    };
  }

  protected buildFilters(queryParams: any): Record<string, any> {
    const filters = super.buildFilters(queryParams);
    
    if (queryParams.category) filters.category = queryParams.category;
    if (queryParams.fileType) {
      // Handle file type filtering
      const mimeTypePatterns: Record<string, string> = {
        'image': '^image/',
        'video': '^video/',
        'audio': '^audio/',
        'pdf': 'pdf',
        'document': '(word|document)',
        'spreadsheet': '(sheet|excel)',
        'presentation': '(presentation|powerpoint)'
      };
      
      const pattern = mimeTypePatterns[queryParams.fileType.toLowerCase()];
      if (pattern) {
        filters.mimeType = { $regex: pattern, $options: 'i' };
      }
    }
    
    return filters;
  }

  // Enhanced file listing with Drive sync
  getAll = handleAsync(async (req: AuthRequest, res: Response) => {
    const options = this.buildQueryOptions(req);
    
    // If user is not authenticated or not admin, only show public files
    if (!req.user || req.user.role !== 'admin') {
      options.filter = { ...options.filter, isPublic: true };
    }
    
    const { data, total } = await driveFileService.findAll({
      ...options,
      populateAuthor: true
    });
    
    res.json(createPaginatedResponse(
      true, 
      'Drive files retrieved successfully', 
      data, 
      options.page || 1, 
      options.limit || 10, 
      total
    ));
  });

  // Get file with Drive sync
  getById = handleAsync(async (req: AuthRequest, res: Response) => {
    const fileId = req.params?.id;
    
    // Try to sync with Drive first
    const syncedFile = await driveFileService.syncWithDrive(fileId);
    
    if (!syncedFile) {
      res.status(404).json(createApiResponse(false, 'File not found'));
      return;
    }

    // Increment views
    await driveFileService.incrementViews(syncedFile._id);

    res.json(createApiResponse(true, 'File retrieved successfully', syncedFile));
  });

  // Get user's files
  getMyFiles = handleAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const options = this.buildQueryOptions(req);
    
    const { data, total } = await driveFileService.findByAuthor(userId!, options);

    res.json(createPaginatedResponse(
      true, 
      'Your files retrieved successfully', 
      data, 
      options.page || 1, 
      options.limit || 10, 
      total
    ));
  });

  // Download file with tracking
  downloadFile = handleAsync(async (req: AuthRequest, res: Response) => {
    const fileId = req.params?.id;
    
    const fileRecord = await driveFileService.findByDriveFileId(fileId);
    if (!fileRecord) {
      res.status(404).json(createApiResponse(false, 'File not found'));
      return;
    }

    // Check access permissions
    if (!fileRecord.isPublic) {
      if (!req.user || (req.user._id.toString() !== fileRecord.uploadedBy.toString() && req.user.role !== 'admin')) {
        res.status(403).json(createApiResponse(false, 'Access denied'));
        return;
      }
    }

    try {
      const fileBuffer = await googleDriveService.downloadFile(fileId);
      
      // Increment downloads
      await driveFileService.incrementDownloads(fileRecord._id);

      res.setHeader('Content-Type', fileRecord.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.name}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json(createApiResponse(false, 'Failed to download file'));
    }
  });

  // Analytics endpoints
  getAnalytics = handleAsync(async (req: AuthRequest, res: Response) => {
    const analytics = {
      mostDownloaded: await driveFileService.getMostDownloaded(5),
      recentUploads: await driveFileService.getRecentUploads(5),
      totalFiles: await driveFileService.findAll({ limit: 1 }),
      filesByCategory: await this.getFilesByCategory(),
      filesByType: await this.getFilesByType()
    };

    res.json(createApiResponse(true, 'Analytics retrieved successfully', analytics));
  });

  private async getFilesByCategory(): Promise<Record<string, number>> {
    const categories = ['notes', 'assignments', 'resources', 'presentations', 'documents', 'media', 'other'];
    const result: Record<string, number> = {};

    for (const category of categories) {
      const { total } = await driveFileService.findByCategory(category, { limit: 1 });
      result[category] = total;
    }

    return result;
  }

  private async getFilesByType(): Promise<Record<string, number>> {
    const types = ['image', 'video', 'audio', 'pdf', 'document', 'spreadsheet', 'presentation'];
    const result: Record<string, number> = {};

    for (const type of types) {
      const { total } = await driveFileService.findByFileType(type, { limit: 1 });
      result[type] = total;
    }

    return result;
  }
}

const driveFileController = new DriveFileController();

export const createDriveFile = driveFileController.create;
export const getDriveFiles = driveFileController.getAll;
export const getDriveFileById = driveFileController.getById;
export const updateDriveFile = driveFileController.update;
export const deleteDriveFile = driveFileController.delete;
export const getMyDriveFiles = driveFileController.getMyFiles;
export const downloadDriveFile = driveFileController.downloadFile;
export const getDriveAnalytics = driveFileController.getAnalytics;