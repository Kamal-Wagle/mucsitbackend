import { Router } from 'express';
import authRoutes from './auth';
import noteRoutes from './notes';
import assignmentRoutes from './assignments';
import resourceRoutes from './resources';
import adminRoutes from './admin';
import driveRoutes from './drive';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'University API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/resources', resourceRoutes);
router.use('/admin', adminRoutes);
router.use('/drive', driveRoutes);

export default router;