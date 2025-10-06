import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Register new organization and SuperAdmin user
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, validate(refreshTokenSchema), authController.logout);

/**
 * @route   POST /api/auth/password/forgot
 * @desc    Request password reset
 * @access  Public
 */
router.post('/password/forgot', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/auth/password/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/password/reset', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email and set password for invited users
 * @access  Public
 */
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @route   POST /api/auth/password/change
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.post('/password/change', authenticate, validate(changePasswordSchema), authController.changePassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.me);

export default router;