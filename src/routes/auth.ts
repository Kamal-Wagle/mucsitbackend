import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema } from '../middleware/validation';
import { authRateLimit } from '../middleware/security';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimit, validateRequest(registerSchema), register);
router.post('/login', authRateLimit, validateRequest(loginSchema), login);

// Protected routes
router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);

export default router;