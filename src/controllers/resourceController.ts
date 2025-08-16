import { Request, Response } from 'express';
import { Resource } from '../models/Resource';
import { AuthRequest, ResourceType } from '../types';
import { createApiResponse, createPaginatedResponse, handleAsync } from '../utils/response';

export const createResource = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const userFullName = req.user?.fullName;
    
    const resourceData = {
      ...req.body,
      author: userId,
      authorName: userFullName
    };

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json(createApiResponse(true, 'Resource created successfully', resource));
  } catch (error: any) {
    console.error('Resource creation error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to create resource', null, error.message));
  }
});

export const getResources = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      department,
      subject,
      course,
      author,
      type,
      category,
      isPublic
    } = req.query as any;

    const query: any = {};

    // Build query filters
    if (search) {
      query.$text = { $search: search };
    }

    if (department) query.department = department;
    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (author) query.author = author;
    if (type) query.type = type;
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // If user is not authenticated or not admin, only show public resources
    if (!req.user || req.user.role !== 'admin') {
      query.isPublic = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'firstName lastName fullName'),
      Resource.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Resources retrieved successfully', resources, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('Resources retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve resources', null, error.message));
  }
});

export const getResourceById = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params?.id;

    const resource = await Resource.findById(resourceId).populate('author', 'firstName lastName fullName');

    if (!resource) {
      res.status(404).json(createApiResponse(false, 'Resource not found'));
      return;
    }

    // Check if resource is public or user has access
    if (!resource.isPublic) {
      if (!req.user || (req.user._id.toString() !== resource.author.toString() && req.user.role !== 'admin')) {
        res.status(403).json(createApiResponse(false, 'Access denied'));
        return;
      }
    }

    // Increment views count
    await Resource.findByIdAndUpdate(resourceId, { $inc: { views: 1 } });

    res.json(createApiResponse(true, 'Resource retrieved successfully', resource));
  } catch (error: any) {
    console.error('Resource retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve resource', null, error.message));
  }
});

export const updateResource = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params?.id;
    const userId = req.user?._id;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      res.status(404).json(createApiResponse(false, 'Resource not found'));
      return;
    }

    // Check ownership or admin access
    if (resource.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json(createApiResponse(false, 'Access denied. You can only update your own resources'));
      return;
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName fullName');

    res.json(createApiResponse(true, 'Resource updated successfully', updatedResource));
  } catch (error: any) {
    console.error('Resource update error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to update resource', null, error.message));
  }
});

export const deleteResource = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params?.id;
    const userId = req.user?._id;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      res.status(404).json(createApiResponse(false, 'Resource not found'));
      return;
    }

    // Check ownership or admin access
    if (resource.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json(createApiResponse(false, 'Access denied. You can only delete your own resources'));
      return;
    }

    await Resource.findByIdAndDelete(resourceId);

    res.json(createApiResponse(true, 'Resource deleted successfully'));
  } catch (error: any) {
    console.error('Resource deletion error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to delete resource', null, error.message));
  }
});

export const getMyResources = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      subject,
      course,
      type,
      category
    } = req.query as any;

    const query: any = { author: userId };

    if (search) {
      query.$text = { $search: search };
    }

    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (type) query.type = type;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Resource.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Your resources retrieved successfully', resources, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('My resources retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve your resources', null, error.message));
  }
});

export const downloadResource = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const resourceId = req.params?.id;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      res.status(404).json(createApiResponse(false, 'Resource not found'));
      return;
    }

    // Check if resource is public or user has access
    if (!resource.isPublic) {
      if (!req.user || (req.user._id.toString() !== resource.author.toString() && req.user.role !== 'admin')) {
        res.status(403).json(createApiResponse(false, 'Access denied'));
        return;
      }
    }

    // For external links, redirect to the URL
    if (resource.type === ResourceType.LINK && resource.externalUrl) {
      // Increment downloads count
      await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });
      res.redirect(resource.externalUrl);
      return;
    }

    // For file resources, you would typically serve the file from your storage
    // This is a simplified version - in production, you'd handle file serving properly
    if (resource.fileUrl) {
      await Resource.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });
      res.redirect(resource.fileUrl);
      return;
    }

    res.status(404).json(createApiResponse(false, 'Resource file not found'));
  } catch (error: any) {
    console.error('Resource download error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to download resource', null, error.message));
  }
});