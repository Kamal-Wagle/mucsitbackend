"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriveAnalytics = exports.downloadDriveFile = exports.getMyDriveFiles = exports.deleteDriveFile = exports.updateDriveFile = exports.getDriveFileById = exports.getDriveFiles = exports.createDriveFile = void 0;
const DriveFileService_1 = require("../services/DriveFileService");
const GoogleDriveService_1 = require("../services/GoogleDriveService");
const BaseController_1 = require("./BaseController");
const response_1 = require("../utils/response");
class DriveFileController extends BaseController_1.BaseController {
    constructor() {
        super(DriveFileService_1.driveFileService);
        this.getAll = (0, response_1.handleAsync)(async (req, res) => {
            const options = this.buildQueryOptions(req);
            if (!req.user || req.user.role !== 'admin') {
                options.filter = { ...options.filter, isPublic: true };
            }
            const { data, total } = await DriveFileService_1.driveFileService.findAll({
                ...options,
                populateAuthor: true
            });
            res.json((0, response_1.createPaginatedResponse)(true, 'Drive files retrieved successfully', data, options.page || 1, options.limit || 10, total));
        });
        this.getById = (0, response_1.handleAsync)(async (req, res) => {
            const fileId = req.params?.id;
            const syncedFile = await DriveFileService_1.driveFileService.syncWithDrive(fileId);
            if (!syncedFile) {
                res.status(404).json((0, response_1.createApiResponse)(false, 'File not found'));
                return;
            }
            await DriveFileService_1.driveFileService.incrementViews(syncedFile._id);
            res.json((0, response_1.createApiResponse)(true, 'File retrieved successfully', syncedFile));
        });
        this.getMyFiles = (0, response_1.handleAsync)(async (req, res) => {
            const userId = req.user?._id;
            const options = this.buildQueryOptions(req);
            const { data, total } = await DriveFileService_1.driveFileService.findByAuthor(userId, options);
            res.json((0, response_1.createPaginatedResponse)(true, 'Your files retrieved successfully', data, options.page || 1, options.limit || 10, total));
        });
        this.downloadFile = (0, response_1.handleAsync)(async (req, res) => {
            const fileId = req.params?.id;
            const fileRecord = await DriveFileService_1.driveFileService.findByDriveFileId(fileId);
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
            try {
                const fileBuffer = await GoogleDriveService_1.googleDriveService.downloadFile(fileId);
                await DriveFileService_1.driveFileService.incrementDownloads(fileRecord._id);
                res.setHeader('Content-Type', fileRecord.mimeType);
                res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.name}"`);
                res.setHeader('Content-Length', fileBuffer.length);
                res.send(fileBuffer);
            }
            catch (error) {
                console.error('Download error:', error);
                res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to download file'));
            }
        });
        this.getAnalytics = (0, response_1.handleAsync)(async (req, res) => {
            const analytics = {
                mostDownloaded: await DriveFileService_1.driveFileService.getMostDownloaded(5),
                recentUploads: await DriveFileService_1.driveFileService.getRecentUploads(5),
                totalFiles: await DriveFileService_1.driveFileService.findAll({ limit: 1 }),
                filesByCategory: await this.getFilesByCategory(),
                filesByType: await this.getFilesByType()
            };
            res.json((0, response_1.createApiResponse)(true, 'Analytics retrieved successfully', analytics));
        });
    }
    getResourceName() {
        return 'DriveFile';
    }
    prepareCreateData(req) {
        return {
            ...req.body,
            uploadedBy: req.user?._id,
            uploaderName: req.user?.fullName
        };
    }
    buildFilters(queryParams) {
        const filters = super.buildFilters(queryParams);
        if (queryParams.category)
            filters.category = queryParams.category;
        if (queryParams.fileType) {
            const mimeTypePatterns = {
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
    async getFilesByCategory() {
        const categories = ['notes', 'assignments', 'resources', 'presentations', 'documents', 'media', 'other'];
        const result = {};
        for (const category of categories) {
            const { total } = await DriveFileService_1.driveFileService.findByCategory(category, { limit: 1 });
            result[category] = total;
        }
        return result;
    }
    async getFilesByType() {
        const types = ['image', 'video', 'audio', 'pdf', 'document', 'spreadsheet', 'presentation'];
        const result = {};
        for (const type of types) {
            const { total } = await DriveFileService_1.driveFileService.findByFileType(type, { limit: 1 });
            result[type] = total;
        }
        return result;
    }
}
const driveFileController = new DriveFileController();
exports.createDriveFile = driveFileController.create;
exports.getDriveFiles = driveFileController.getAll;
exports.getDriveFileById = driveFileController.getById;
exports.updateDriveFile = driveFileController.update;
exports.deleteDriveFile = driveFileController.delete;
exports.getMyDriveFiles = driveFileController.getMyFiles;
exports.downloadDriveFile = driveFileController.downloadFile;
exports.getDriveAnalytics = driveFileController.getAnalytics;
//# sourceMappingURL=enhancedDriveController.js.map