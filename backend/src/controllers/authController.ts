import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import {
  registerUser, loginUser, refreshAccessToken,
  logoutUser, updateUserProfile,
} from '../services/authService';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendSuccess, sendError } from '../utils/response';

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, password } = req.body;
    const user = await registerUser(email, name, password);
    return sendSuccess(res, user, 'Account created successfully', 201);
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return sendSuccess(res, result, 'Logged in successfully');
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);
    const result = await refreshAccessToken(refreshToken);
    return sendSuccess(res, result, 'Token refreshed');
  } catch (err) {
    return next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await logoutUser(refreshToken);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, user);
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const updated = await updateUserProfile(req.user!.userId, req.body);
    return sendSuccess(res, updated, 'Profile updated');
  } catch (err) {
    return next(err);
  }
}
