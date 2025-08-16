import { Request, Response } from 'express';
import multer from 'multer';
import { DriveFile } from '../models/DriveFile';
import { AuthRequest } from '../types';
import { createApiResponse, createPaginatedResponse, handleAsync } from '../utils/response';
import { googleDriveConfig } from '../config/googleDrive';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'audio/mpeg',
      'audio/wav'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents, images, videos, and audio files are allowed.'));
    }
  }
});

export const uploadMiddleware = upload.single('file');

export const uploadFile = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(createApiResponse(false, 'No file provided'));
    }

    const { name, description, department, course, subject, category, tags, isPublic = true } = req.body;
    const fileName = name || req.file.originalname;

    // Upload to Google Drive
    const drive = googleDriveConfig.getDriveInstance();
    const fileMetadata = {
      name: fileName,
      description: description || `Uploaded by ${req.user?.fullName}`
    };

    const media = {
      mimeType: req.file.mimetype,
      body: req.file.buffer
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink'
    });

    // Make file publicly readable
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Create database record
    const driveFileData = {
      driveFileId: driveResponse.data.id,
      name: driveResponse.data.name,
      originalName: req.file.originalname,
      mimeType: driveResponse.data.mimeType,
      size: parseInt(driveResponse.data.size) || 0,
      driveUrl: driveResponse.data.webViewLink,
      webViewLink: driveResponse.data.webViewLink,
      webContentLink: driveResponse.data.webContentLink,
      uploadedBy: req.user!._id,
      uploaderName: req.user!.fullName,
      department: department || 'General',
      course,
      subject,
      category: category || 'documents',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      isPublic: isPublic === 'true' || isPublic === true
    };

    const fileRecord = new DriveFile(driveFileData);
    await fileRecord.save();

    return res.status(201).json(createApiResponse(true, 'File uploaded successfully', {
      driveFile: driveResponse.data,
      record: fileRecord
    }));
  } catch (error: any) {
    console.error('Drive upload error:', error);
    return res.status(500).json(createApiResponse(false, 'Failed to upload file to Google Drive', null, error.message));
  }
});

export const getDriveFiles = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      department,
      course,
      subject,
      category,
      fileType,
      isPublic
    } = req.query as any;

    const query: any = {};

    // Build query filters
    if (search) {
      query.$text = { $search: search };
    }

    if (department) query.department = department;
    if (course) query.course = course;
    if (subject) query.subject = subject;
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // File type filtering
    if (fileType) {
      const mimeTypePatterns: Record<string, string> = {
        'image': '^image/',
        'video': '^video/',
        'audio': '^audio/',
        'pdf': 'pdf',
        'document': '(word|document)',
        'spreadsheet': '(sheet|excel)',
        'presentation': '(presentation|powerpoint)'
      };
      
      const pattern = mimeTypePatterns[fileType.toLowerCase()];
      if (pattern) {
        query.mimeType = { $regex: pattern, $options: 'i' };
      }
    }

    // If user is not authenticated or not admin, only show public files
    if (!req.user || req.user.role !== 'admin') {
      query.isPublic = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [files, total] = await Promise.all([
      DriveFile.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'firstName lastName fullName'),
      DriveFile.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Drive files retrieved successfully', files, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('Drive files retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve drive files', null, error.message));
  }
});

export const getDriveFileById = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const fileId = req.params.fileId;

    const fileRecord = await DriveFile.findOne({ driveFileId: fileId })
      .populate('uploadedBy', 'firstName lastName fullName');

    if (!fileRecord) {
      return res.status(404).json(createApiResponse(false, 'File not found'));
    }

    // Check access permissions
    if (!fileRecord.isPublic) {
      if (!req.user || (req.user._id.toString() !== fileRecord.uploadedBy.toString() && req.user.role !== 'admin')) {
        return res.status(403).json(createApiResponse(false, 'Access denied'));
      }
    }

    // Increment views
    await DriveFile.findByIdAndUpdate(fileRecord._id, { $inc: { views: 1 } });

    return res.json(createApiResponse(true, 'File retrieved successfully', fileRecord));
  } catch (error: any) {
    console.error('Drive file retrieval error:', error);
    return res.status(500).json(createApiResponse(false, 'Failed to retrieve drive file', null, error.message));
  }
});

export const updateFile = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const fileId = req.params.fileId;
    const { name, description, department, course, subject, category, tags, isPublic } = req.body;

    const fileRecord = await DriveFile.findOne({ driveFileId: fileId });

    if (!fileRecord) {
      return res.status(404).json(createApiResponse(false, 'File not found'));
    }

    // Check ownership or admin access
    if (fileRecord.uploadedBy.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json(createApiResponse(false, 'Access denied. You can only update your own files'));
    }

    // Update Google Drive file metadata
    const drive = googleDriveConfig.getDriveInstance();
    const updateData: any = {};

    if (name || description) {
      updateData.requestBody = {
        name: name || fileRecord.name,
        description: description
      };
    }

    if (req.file) {
      updateData.media = {
        mimeType: req.file.mimetype,
        body: req.file.buffer
      };
    }

    if (Object.keys(updateData).length > 0) {
      updateData.fileId = fileId;
      updateData.fields = 'id,name,mimeType,size,modifiedTime,webViewLink,webContentLink';
      
      const driveResponse = await drive.files.update(updateData);
      
      // Update database record
      const updatedRecord = await DriveFile.findByIdAndUpdate(
        fileRecord._id,
        {
          name: driveResponse.data.name,
          mimeType: driveResponse.data.mimeType,
          size: parseInt(driveResponse.data.size) || fileRecord.size,
          webViewLink: driveResponse.data.webViewLink,
          webContentLink: driveResponse.data.webContentLink,
          department: department || fileRecord.department,
          course: course || fileRecord.course,
          subject: subject || fileRecord.subject,
          category: category || fileRecord.category,
          tags: tags ? (Array.isArray(tags) ? tags : [tags]) : fileRecord.tags,
          isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : fileRecord.isPublic
        },
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'firstName lastName fullName');

      return res.json(createApiResponse(true, 'File updated successfully', updatedRecord));
    } else {
      // Only update database fields
      const updatedRecord = await DriveFile.findByIdAndUpdate(
        fileRecord._id,
        {
          department: department || fileRecord.department,
          course: course || fileRecord.course,
          subject: subject || fileRecord.subject,
          category: category || fileRecord.category,
          tags: tags ? (Array.isArray(tags) ? tags : [tags]) : fileRecord.tags,
          isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : fileRecord.isPublic
        },
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'firstName lastName fullName');

      return res.json(createApiResponse(true, 'File metadata updated successfully', updatedRecord));
    }
  } catch (error: any) {
    console.error('Drive file update error:', error);
    return res.status(500).json(createApiResponse(false, 'Failed to update drive file', null, error.message));
  }
});

export const deleteFile = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const fileId = req.params?.fileId;

    const fileRecord = await DriveFile.findOne({ driveFileId: fileId });

    if (!fileRecord) {
      res.status(404).json(createApiResponse(false, 'File not found'));
      return;
    }

    // Check ownership or admin access
    if (fileRecord.uploadedBy.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      res.status(403).json(createApiResponse(false, 'Access denied. You can only delete your own files'));
      return;
    }

    // Delete from Google Drive
    const drive = googleDriveConfig.getDriveInstance();
    await drive.files.delete({ fileId });

    // Delete from database
    await DriveFile.findByIdAndDelete(fileRecord._id);

    res.json(createApiResponse(true, 'File deleted successfully'));
  } catch (error: any) {
    console.error('Drive file deletion error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to delete drive file', null, error.message));
  }
});

export const getMyDriveFiles = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      department,
      course,
      subject,
      category,
      fileType
    } = req.query as any;

    const query: any = { uploadedBy: userId };

    if (search) {
      query.$text = { $search: search };
    }

    if (department) query.department = department;
    if (course) query.course = course;
    if (subject) query.subject = subject;
    if (category) query.category = category;

    // File type filtering
    if (fileType) {
      const mimeTypePatterns: Record<string, string> = {
        'image': '^image/',
        'video': '^video/',
        'audio': '^audio/',
        'pdf': 'pdf',
        'document': '(word|document)',
        'spreadsheet': '(sheet|excel)',
        'presentation': '(presentation|powerpoint)'
      };
      
      const pattern = mimeTypePatterns[fileType.toLowerCase()];
      if (pattern) {
        query.mimeType = { $regex: pattern, $options: 'i' };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [files, total] = await Promise.all([
      DriveFile.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DriveFile.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Your drive files retrieved successfully', files, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('My drive files retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve your drive files', null, error.message));
  }
});

export const downloadDriveFile = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const fileId = req.params?.fileId;

    const fileRecord = await DriveFile.findOne({ driveFileId: fileId });
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

    // Download from Google Drive
    const drive = googleDriveConfig.getDriveInstance();
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    // Increment downloads count
    await DriveFile.findByIdAndUpdate(fileRecord._id, { $inc: { downloads: 1 } });

    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.name}"`);
    
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Drive file download error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to download drive file', null, error.message));
  }
});

export const createFolder = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId } = req.body || {};

    if (!name) {
      res.status(400).json(createApiResponse(false, 'Folder name is required'));
      return;
    }

    const drive = googleDriveConfig.getDriveInstance();
    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id,name,mimeType,createdTime,webViewLink,parents'
    });

    res.status(201).json(createApiResponse(true, 'Folder created successfully', response.data));
  } catch (error: any) {
    console.error('Drive folder creation error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to create folder', null, error.message));
  }
});

export const shareFile = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params || {};
    const { email, role = 'reader' } = req.body || {};

    if (!email) {
      res.status(400).json(createApiResponse(false, 'Email is required'));
      return;
    }

    const drive = googleDriveConfig.getDriveInstance();
    await drive.permissions.create({
      fileId,
      requestBody: {
        role,
        type: 'user',
        emailAddress: email
      }
    });

    res.json(createApiResponse(true, 'File shared successfully'));
  } catch (error: any) {
    console.error('Drive file sharing error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to share file', null, error.message));
  }
});

export const getFilePermissions = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params || {};

    const drive = googleDriveConfig.getDriveInstance();
    const response = await drive.permissions.list({ fileId });

    res.json(createApiResponse(true, 'File permissions retrieved successfully', response.data));
  } catch (error: any) {
    console.error('Drive file permissions retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve file permissions', null, error.message));
  }
});

export const getDriveAnalytics = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    // Get analytics data
    const [
      totalFiles,
      mostDownloaded,
      recentUploads,
      filesByCategory,
      filesByType
    ] = await Promise.all([
      DriveFile.countDocuments({ isPublic: true }),
      DriveFile.find({ isPublic: true }).sort({ downloads: -1 }).limit(5).populate('uploadedBy', 'firstName lastName'),
      DriveFile.find({ isPublic: true }).sort({ createdAt: -1 }).limit(5).populate('uploadedBy', 'firstName lastName'),
      DriveFile.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      DriveFile.aggregate([
        { $match: { isPublic: true } },
        { $addFields: { fileType: { $cond: [
          { $regexMatch: { input: '$mimeType', regex: '^image/' } }, 'image',
          { $cond: [
            { $regexMatch: { input: '$mimeType', regex: '^video/' } }, 'video',
            { $cond: [
              { $regexMatch: { input: '$mimeType', regex: '^audio/' } }, 'audio',
              { $cond: [
                { $regexMatch: { input: '$mimeType', regex: 'pdf' } }, 'pdf',
                'document'
              ]}
            ]}
          ]}
        ]}}},
        { $group: { _id: '$fileType', count: { $sum: 1 } } }
      ])
    ]);

    const analytics = {
      totalFiles,
      mostDownloaded,
      recentUploads,
      filesByCategory: filesByCategory.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      filesByType: filesByType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json(createApiResponse(true, 'Drive analytics retrieved successfully', analytics));
  } catch (error: any) {
    console.error('Drive analytics error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve drive analytics', null, error.message));
  }
});

// Legacy Google Drive API endpoints (direct Drive operations)
export const getFiles = handleAsync(async (req: Request, res: Response) => {
  try {
    const { search, limit = 10 } = req.query as any;

    const drive = googleDriveConfig.getDriveInstance();
    
    if (search) {
      const response = await drive.files.list({
        q: `name contains '${search}' and trashed=false`,
        pageSize: parseInt(limit),
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)'
      });
      
      res.json(createApiResponse(true, 'Files retrieved successfully', response.data.files));
    } else {
      const response = await drive.files.list({
        pageSize: parseInt(limit),
        orderBy: 'modifiedTime desc',
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)'
      });

      res.json(createApiResponse(true, 'Files retrieved successfully', response.data.files));
    }
  } catch (error: any) {
    console.error('Drive files list error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve files from Google Drive', null, error.message));
  }
});

export const getFileById = handleAsync(async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const drive = googleDriveConfig.getDriveInstance();
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
    });

    res.json(createApiResponse(true, 'File retrieved successfully', response.data));
  } catch (error: any) {
    console.error('Drive file get error:', error);
    if (error.code === 404) {
      res.status(404).json(createApiResponse(false, 'File not found'));
    } else {
      res.status(500).json(createApiResponse(false, 'Failed to retrieve file from Google Drive', null, error.message));
    }
  }
});

export const downloadFile = handleAsync(async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const drive = googleDriveConfig.getDriveInstance();
    
    // Get file metadata first
    const fileInfo = await drive.files.get({
      fileId,
      fields: 'name,mimeType,size'
    });

    // Download file content
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    res.setHeader('Content-Type', fileInfo.data.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.data.name}"`);
    
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Drive file download error:', error);
    if (error.code === 404) {
      res.status(404).json(createApiResponse(false, 'File not found'));
    } else {
      res.status(500).json(createApiResponse(false, 'Failed to download file from Google Drive', null, error.message));
    }
  }
});