import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { User } from '../models/User';
import { Note } from '../models/Note';
import { Assignment } from '../models/Assignment';
import { Resource } from '../models/Resource';
import { DriveFile } from '../models/DriveFile';
import { createApiResponse, handleAsync } from '../utils/response';

const router = Router();

// Admin only routes
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Dashboard statistics - each feature handles its own stats independently
router.get('/dashboard', handleAsync(async (req: any, res: any) => {
  try {
    // Get stats from each feature independently
    // If one fails, others will still work
    let userStats: any = { total: 0, error: null };
    let noteStats: any = { total: 0, error: null };
    let assignmentStats: any = { total: 0, error: null };
    let resourceStats: any = { total: 0, error: null };
    let driveStats: any = { total: 0, error: null };

    // Users stats
    try {
      userStats.total = await User.countDocuments({ isActive: true });
    } catch (error: any) {
      userStats.error = 'Failed to get user stats';
      console.error('User stats error:', error);
    }

    // Notes stats
    try {
      noteStats.total = await Note.countDocuments({ isPublic: true });
    } catch (error: any) {
      noteStats.error = 'Failed to get note stats';
      console.error('Note stats error:', error);
    }

    // Assignments stats
    try {
      assignmentStats.total = await Assignment.countDocuments({ isActive: true });
    } catch (error: any) {
      assignmentStats.error = 'Failed to get assignment stats';
      console.error('Assignment stats error:', error);
    }

    // Resources stats
    try {
      resourceStats.total = await Resource.countDocuments({ isPublic: true });
    } catch (error: any) {
      resourceStats.error = 'Failed to get resource stats';
      console.error('Resource stats error:', error);
    }

    // Drive files stats
    try {
      driveStats.total = await DriveFile.countDocuments({ isPublic: true });
    } catch (error: any) {
      driveStats.error = 'Failed to get drive stats';
      console.error('Drive stats error:', error);
    }

    const stats = {
      users: userStats,
      notes: noteStats,
      assignments: assignmentStats,
      resources: resourceStats,
      driveFiles: driveStats,
      lastUpdated: new Date()
    };

    res.json(createApiResponse(true, 'Dashboard statistics retrieved', stats));
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve dashboard statistics', null, error.message));
  }
}));

// User management - independent of other features
router.get('/users', handleAsync(async (req: any, res: any) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      role,
      department
    } = req.query as any;

    const query: any = {};

    if (role) query.role = role;
    if (department) query.department = department;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error: any) {
    console.error('Users retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve users', null, error.message));
  }
}));

router.patch('/users/:id/deactivate', handleAsync(async (req: any, res: any) => {
  try {
    const userId = req.params.id;
    const result = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

    if (!result) {
      res.status(404).json(createApiResponse(false, 'User not found'));
      return;
    }

    res.json(createApiResponse(true, 'User deactivated successfully', result));
  } catch (error: any) {
    console.error('User deactivation error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to deactivate user', null, error.message));
  }
}));

// Health check endpoint
router.get('/health', handleAsync(async (req: any, res: any) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(createApiResponse(true, 'Health check successful', health));
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json(createApiResponse(false, 'Health check failed', null, error.message));
  }
}));

export default router;