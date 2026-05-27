import { Router } from 'express';
import {
  register, login, refresh, logout, getMe, updateProfile,
  registerValidation, loginValidation,
} from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);

export default router;
