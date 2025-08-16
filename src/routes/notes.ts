import { Router } from 'express';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getMyNotes,
  downloadNote
} from '../controllers/noteController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { createNoteSchema, updateNoteSchema, paginationSchema } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, validateQuery(paginationSchema), getNotes);
router.get('/:id', optionalAuth, getNoteById);
router.get('/:id/download', optionalAuth, downloadNote);

// Protected routes
router.use(authenticate);
router.post('/', authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), validateRequest(createNoteSchema), createNote);
router.get('/my/notes', validateQuery(paginationSchema), getMyNotes);
router.put('/:id', validateRequest(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;