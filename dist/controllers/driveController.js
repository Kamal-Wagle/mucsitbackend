"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.getFileById = exports.getFiles = exports.getDriveAnalytics = exports.getFilePermissions = exports.shareFile = exports.createFolder = exports.downloadDriveFile = exports.getMyDriveFiles = exports.deleteFile = exports.updateFile = exports.getDriveFileById = exports.getDriveFiles = exports.uploadFile = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const DriveFile_1 = require("../models/DriveFile");
const response_1 = require("../utils/response");
const googleDrive_1 = require("../config/googleDrive");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
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
        }
        else {
            cb(new Error('Invalid file type. Only documents, images, videos, and audio files are allowed.'));
        }
    }
});
exports.uploadMiddleware = upload.single('file');
exports.uploadFile = (0, response_1.handleAsync)(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json((0, response_1.createApiResponse)(false, 'No file provided'));
        }
        const { name, description, department, course, subject, category, tags, isPublic = true } = req.body;
        const fileName = name || req.file.originalname;
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
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
        await drive.permissions.create({
            fileId: driveResponse.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });
        const driveFileData = {
            driveFileId: driveResponse.data.id,
            name: driveResponse.data.name,
            originalName: req.file.originalname,
            mimeType: driveResponse.data.mimeType,
            size: parseInt(driveResponse.data.size) || 0,
            driveUrl: driveResponse.data.webViewLink,
            webViewLink: driveResponse.data.webViewLink,
            webContentLink: driveResponse.data.webContentLink,
            uploadedBy: req.user._id,
            uploaderName: req.user.fullName,
            department: department || 'General',
            course,
            subject,
            category: category || 'documents',
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            isPublic: isPublic === 'true' || isPublic === true
        };
        const fileRecord = new DriveFile_1.DriveFile(driveFileData);
        await fileRecord.save();
        return res.status(201).json((0, response_1.createApiResponse)(true, 'File uploaded successfully', {
            driveFile: driveResponse.data,
            record: fileRecord
        }));
    }
    catch (error) {
        console.error('Drive upload error:', error);
        return res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to upload file to Google Drive', null, error.message));
    }
});
exports.getDriveFiles = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', search, department, course, subject, category, fileType, isPublic } = req.query;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (department)
            query.department = department;
        if (course)
            query.course = course;
        if (subject)
            query.subject = subject;
        if (category)
            query.category = category;
        if (isPublic !== undefined)
            query.isPublic = isPublic === 'true';
        if (fileType) {
            const mimeTypePatterns = {
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
        if (!req.user || req.user.role !== 'admin') {
            query.isPublic = true;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [files, total] = await Promise.all([
            DriveFile_1.DriveFile.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('uploadedBy', 'firstName lastName fullName'),
            DriveFile_1.DriveFile.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Drive files retrieved successfully', files, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('Drive files retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve drive files', null, error.message));
    }
});
exports.getDriveFileById = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const fileRecord = await DriveFile_1.DriveFile.findOne({ driveFileId: fileId })
            .populate('uploadedBy', 'firstName lastName fullName');
        if (!fileRecord) {
            return res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
        }
        if (!fileRecord.isPublic) {
            if (!req.user || (req.user._id.toString() !== fileRecord.uploadedBy.toString() && req.user.role !== 'admin')) {
                return res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied'));
            }
        }
        await DriveFile_1.DriveFile.findByIdAndUpdate(fileRecord._id, { $inc: { views: 1 } });
        return res.json((0, response_1.createApiResponse)(true, 'File retrieved successfully', fileRecord));
    }
    catch (error) {
        console.error('Drive file retrieval error:', error);
        return res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve drive file', null, error.message));
    }
});
exports.updateFile = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const { name, description, department, course, subject, category, tags, isPublic } = req.body;
        const fileRecord = await DriveFile_1.DriveFile.findOne({ driveFileId: fileId });
        if (!fileRecord) {
            return res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
        }
        if (fileRecord.uploadedBy.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
            return res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only update your own files'));
        }
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        const updateData = {};
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
            const updatedRecord = await DriveFile_1.DriveFile.findByIdAndUpdate(fileRecord._id, {
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
            }, { new: true, runValidators: true }).populate('uploadedBy', 'firstName lastName fullName');
            return res.json((0, response_1.createApiResponse)(true, 'File updated successfully', updatedRecord));
        }
        else {
            const updatedRecord = await DriveFile_1.DriveFile.findByIdAndUpdate(fileRecord._id, {
                department: department || fileRecord.department,
                course: course || fileRecord.course,
                subject: subject || fileRecord.subject,
                category: category || fileRecord.category,
                tags: tags ? (Array.isArray(tags) ? tags : [tags]) : fileRecord.tags,
                isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : fileRecord.isPublic
            }, { new: true, runValidators: true }).populate('uploadedBy', 'firstName lastName fullName');
            return res.json((0, response_1.createApiResponse)(true, 'File metadata updated successfully', updatedRecord));
        }
    }
    catch (error) {
        console.error('Drive file update error:', error);
        return res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to update drive file', null, error.message));
    }
});
exports.deleteFile = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const fileId = req.params?.fileId;
        const fileRecord = await DriveFile_1.DriveFile.findOne({ driveFileId: fileId });
        if (!fileRecord) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
            return;
        }
        if (fileRecord.uploadedBy.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
            res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only delete your own files'));
            return;
        }
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        await drive.files.delete({ fileId });
        await DriveFile_1.DriveFile.findByIdAndDelete(fileRecord._id);
        res.json((0, response_1.createApiResponse)(true, 'File deleted successfully'));
    }
    catch (error) {
        console.error('Drive file deletion error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to delete drive file', null, error.message));
    }
});
exports.getMyDriveFiles = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, sort = '-createdAt', search, department, course, subject, category, fileType } = req.query;
        const query = { uploadedBy: userId };
        if (search) {
            query.$text = { $search: search };
        }
        if (department)
            query.department = department;
        if (course)
            query.course = course;
        if (subject)
            query.subject = subject;
        if (category)
            query.category = category;
        if (fileType) {
            const mimeTypePatterns = {
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
            DriveFile_1.DriveFile.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            DriveFile_1.DriveFile.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Your drive files retrieved successfully', files, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('My drive files retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve your drive files', null, error.message));
    }
});
exports.downloadDriveFile = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const fileId = req.params?.fileId;
        const fileRecord = await DriveFile_1.DriveFile.findOne({ driveFileId: fileId });
        if (!fileRecord) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
            return;
        }
        if (!fileRecord.isPublic) {
            if (!req.user || (req.user._id.toString() !== fileRecord.uploadedBy.toString() && req.user.role !== 'admin')) {
                res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied'));
                return;
            }
        }
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        const response = await drive.files.get({
            fileId,
            alt: 'media'
        }, { responseType: 'stream' });
        await DriveFile_1.DriveFile.findByIdAndUpdate(fileRecord._id, { $inc: { downloads: 1 } });
        res.setHeader('Content-Type', fileRecord.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.name}"`);
        response.data.pipe(res);
    }
    catch (error) {
        console.error('Drive file download error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to download drive file', null, error.message));
    }
});
exports.createFolder = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { name, parentId } = req.body || {};
        if (!name) {
            res.status(400).json((0, response_1.createApiResponse)(false, 'Folder name is required'));
            return;
        }
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        const fileMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined
        };
        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id,name,mimeType,createdTime,webViewLink,parents'
        });
        res.status(201).json((0, response_1.createApiResponse)(true, 'Folder created successfully', response.data));
    }
    catch (error) {
        console.error('Drive folder creation error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to create folder', null, error.message));
    }
});
exports.shareFile = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { fileId } = req.params || {};
        const { email, role = 'reader' } = req.body || {};
        if (!email) {
            res.status(400).json((0, response_1.createApiResponse)(false, 'Email is required'));
            return;
        }
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        await drive.permissions.create({
            fileId,
            requestBody: {
                role,
                type: 'user',
                emailAddress: email
            }
        });
        res.json((0, response_1.createApiResponse)(true, 'File shared successfully'));
    }
    catch (error) {
        console.error('Drive file sharing error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to share file', null, error.message));
    }
});
exports.getFilePermissions = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { fileId } = req.params || {};
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        const response = await drive.permissions.list({ fileId });
        res.json((0, response_1.createApiResponse)(true, 'File permissions retrieved successfully', response.data));
    }
    catch (error) {
        console.error('Drive file permissions retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve file permissions', null, error.message));
    }
});
exports.getDriveAnalytics = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const [totalFiles, mostDownloaded, recentUploads, filesByCategory, filesByType] = await Promise.all([
            DriveFile_1.DriveFile.countDocuments({ isPublic: true }),
            DriveFile_1.DriveFile.find({ isPublic: true }).sort({ downloads: -1 }).limit(5).populate('uploadedBy', 'firstName lastName'),
            DriveFile_1.DriveFile.find({ isPublic: true }).sort({ createdAt: -1 }).limit(5).populate('uploadedBy', 'firstName lastName'),
            DriveFile_1.DriveFile.aggregate([
                { $match: { isPublic: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
            DriveFile_1.DriveFile.aggregate([
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
                                                    ] }
                                            ] }
                                    ] }
                            ] } } },
                { $group: { _id: '$fileType', count: { $sum: 1 } } }
            ])
        ]);
        const analytics = {
            totalFiles,
            mostDownloaded,
            recentUploads,
            filesByCategory: filesByCategory.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            filesByType: filesByType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };
        res.json((0, response_1.createApiResponse)(true, 'Drive analytics retrieved successfully', analytics));
    }
    catch (error) {
        console.error('Drive analytics error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve drive analytics', null, error.message));
    }
});
exports.getFiles = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { search, limit = 10 } = req.query;
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        if (search) {
            const response = await drive.files.list({
                q: `name contains '${search}' and trashed=false`,
                pageSize: parseInt(limit),
                fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)'
            });
            res.json((0, response_1.createApiResponse)(true, 'Files retrieved successfully', response.data.files));
        }
        else {
            const response = await drive.files.list({
                pageSize: parseInt(limit),
                orderBy: 'modifiedTime desc',
                fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)'
            });
            res.json((0, response_1.createApiResponse)(true, 'Files retrieved successfully', response.data.files));
        }
    }
    catch (error) {
        console.error('Drive files list error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve files from Google Drive', null, error.message));
    }
});
exports.getFileById = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { fileId } = req.params;
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        const response = await drive.files.get({
            fileId,
            fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
        });
        res.json((0, response_1.createApiResponse)(true, 'File retrieved successfully', response.data));
    }
    catch (error) {
        console.error('Drive file get error:', error);
        if (error.code === 404) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
        }
        else {
            res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve file from Google Drive', null, error.message));
        }
    }
});
exports.downloadFile = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { fileId } = req.params;
        const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
        const fileInfo = await drive.files.get({
            fileId,
            fields: 'name,mimeType,size'
        });
        const response = await drive.files.get({
            fileId,
            alt: 'media'
        }, { responseType: 'stream' });
        res.setHeader('Content-Type', fileInfo.data.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.data.name}"`);
        response.data.pipe(res);
    }
    catch (error) {
        console.error('Drive file download error:', error);
        if (error.code === 404) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
        }
        else {
            res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to download file from Google Drive', null, error.message));
        }
    }
});
//# sourceMappingURL=driveController.js.map