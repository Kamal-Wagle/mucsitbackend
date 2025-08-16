import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  getMyResources,
  downloadResource
} from '../controllers/resourceController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { createResourceSchema, updateResourceSchema, paginationSchema } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, validateQuery(paginationSchema), getResources);
router.get('/:id', optionalAuth, getResourceById);
router.get('/:id/download', optionalAuth, downloadResource);

// Protected routes
router.use(authenticate);
router.post('/', authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), validateRequest(createResourceSchema), createResource);
router.get('/my/resources', validateQuery(paginationSchema), getMyResources);
router.put('/:id', validateRequest(updateResourceSchema), updateResource);
router.delete('/:id', deleteResource);

export default router;