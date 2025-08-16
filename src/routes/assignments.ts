import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getMyAssignments
} from '../controllers/assignmentController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { createAssignmentSchema, updateAssignmentSchema, paginationSchema } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Protected routes
router.use(authenticate);
router.get('/', validateQuery(paginationSchema), getAssignments);
router.get('/my/assignments', authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), validateQuery(paginationSchema), getMyAssignments);
router.post('/', authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), validateRequest(createAssignmentSchema), createAssignment);
router.get('/:id', getAssignmentById);
router.put('/:id', validateRequest(updateAssignmentSchema), updateAssignment);
router.delete('/:id', deleteAssignment);

export default router;