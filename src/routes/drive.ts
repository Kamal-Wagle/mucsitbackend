import { Router } from 'express';
import {
  uploadFile,
  getFiles,
  getFileById,
  downloadFile,
  updateFile,
  deleteFile,
  createFolder,
  shareFile,
  getFilePermissions,
  uploadMiddleware,
  getDriveFiles,
  getDriveFileById,
  getMyDriveFiles,
  downloadDriveFile,
  getDriveAnalytics
} from '../controllers/driveController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { driveValidationSchemas } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// File operations
router.post('/upload', uploadMiddleware, uploadFile);
router.get('/files', getDriveFiles);
router.get('/files/:fileId', getDriveFileById);
router.get('/files/:fileId/download', downloadDriveFile);
router.put('/files/:fileId', uploadMiddleware, updateFile);
router.delete('/files/:fileId', deleteFile);

// User files
router.get('/my/files', getMyDriveFiles);

// Analytics (Admin only)
router.get('/analytics', authorize(UserRole.ADMIN), getDriveAnalytics);

// Folder operations
router.post('/folders', validateRequest(driveValidationSchemas.createFolder), createFolder);

// Sharing operations (Instructor/Admin only)
router.post('/files/:fileId/share', 
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), 
  validateRequest(driveValidationSchemas.shareFile), 
  shareFile
);
router.get('/files/:fileId/permissions', getFilePermissions);

// Legacy Google Drive API endpoints (direct Drive operations)
router.get('/drive/files', getFiles);
router.get('/drive/files/:fileId', getFileById);
router.get('/drive/files/:fileId/download', downloadFile);

export default router;