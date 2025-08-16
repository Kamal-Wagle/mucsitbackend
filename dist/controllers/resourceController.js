"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadResource = exports.getMyResources = exports.deleteResource = exports.updateResource = exports.getResourceById = exports.getResources = exports.createResource = void 0;
const Resource_1 = require("../models/Resource");
const types_1 = require("../types");
const response_1 = require("../utils/response");
exports.createResource = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const userFullName = req.user?.fullName;
        const resourceData = {
            ...req.body,
            author: userId,
            authorName: userFullName
        };
        const resource = new Resource_1.Resource(resourceData);
        await resource.save();
        res.status(201).json((0, response_1.createApiResponse)(true, 'Resource created successfully', resource));
    }
    catch (error) {
        console.error('Resource creation error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to create resource', null, error.message));
    }
});
exports.getResources = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', search, department, subject, course, author, type, category, isPublic } = req.query;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (department)
            query.department = department;
        if (subject)
            query.subject = subject;
        if (course)
            query.course = course;
        if (author)
            query.author = author;
        if (type)
            query.type = type;
        if (category)
            query.category = category;
        if (isPublic !== undefined)
            query.isPublic = isPublic === 'true';
        if (!req.user || req.user.role !== 'admin') {
            query.isPublic = true;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [resources, total] = await Promise.all([
            Resource_1.Resource.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('author', 'firstName lastName fullName'),
            Resource_1.Resource.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Resources retrieved successfully', resources, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('Resources retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve resources', null, error.message));
    }
});
exports.getResourceById = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const resourceId = req.params?.id;
        const resource = await Resource_1.Resource.findById(resourceId).populate('author', 'firstName lastName fullName');
        if (!resource) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Resource not found'));
            return;
        }
        if (!resource.isPublic) {
            if (!req.user || (req.user._id.toString() !== resource.author.toString() && req.user.role !== 'admin')) {
                res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied'));
                return;
            }
        }
        await Resource_1.Resource.findByIdAndUpdate(resourceId, { $inc: { views: 1 } });
        res.json((0, response_1.createApiResponse)(true, 'Resource retrieved successfully', resource));
    }
    catch (error) {
        console.error('Resource retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve resource', null, error.message));
    }
});
exports.updateResource = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const resourceId = req.params?.id;
        const userId = req.user?._id;
        const resource = await Resource_1.Resource.findById(resourceId);
        if (!resource) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Resource not found'));
            return;
        }
        if (resource.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
            res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only update your own resources'));
            return;
        }
        const updatedResource = await Resource_1.Resource.findByIdAndUpdate(resourceId, { ...req.body }, { new: true, runValidators: true }).populate('author', 'firstName lastName fullName');
        res.json((0, response_1.createApiResponse)(true, 'Resource updated successfully', updatedResource));
    }
    catch (error) {
        console.error('Resource update error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to update resource', null, error.message));
    }
});
exports.deleteResource = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const resourceId = req.params?.id;
        const userId = req.user?._id;
        const resource = await Resource_1.Resource.findById(resourceId);
        if (!resource) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Resource not found'));
            return;
        }
        if (resource.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
            res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only delete your own resources'));
            return;
        }
        await Resource_1.Resource.findByIdAndDelete(resourceId);
        res.json((0, response_1.createApiResponse)(true, 'Resource deleted successfully'));
    }
    catch (error) {
        console.error('Resource deletion error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to delete resource', null, error.message));
    }
});
exports.getMyResources = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, sort = '-createdAt', search, subject, course, type, category } = req.query;
        const query = { author: userId };
        if (search) {
            query.$text = { $search: search };
        }
        if (subject)
            query.subject = subject;
        if (course)
            query.course = course;
        if (type)
            query.type = type;
        if (category)
            query.category = category;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [resources, total] = await Promise.all([
            Resource_1.Resource.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Resource_1.Resource.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Your resources retrieved successfully', resources, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('My resources retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve your resources', null, error.message));
    }
});
exports.downloadResource = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const resourceId = req.params?.id;
        const resource = await Resource_1.Resource.findById(resourceId);
        if (!resource) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Resource not found'));
            return;
        }
        if (!resource.isPublic) {
            if (!req.user || (req.user._id.toString() !== resource.author.toString() && req.user.role !== 'admin')) {
                res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied'));
                return;
            }
        }
        if (resource.type === types_1.ResourceType.LINK && resource.externalUrl) {
            await Resource_1.Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });
            res.redirect(resource.externalUrl);
            return;
        }
        if (resource.fileUrl) {
            await Resource_1.Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });
            res.redirect(resource.fileUrl);
            return;
        }
        res.status(404).json((0, response_1.createApiResponse)(false, 'Resource file not found'));
    }
    catch (error) {
        console.error('Resource download error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to download resource', null, error.message));
    }
});
//# sourceMappingURL=resourceController.js.map