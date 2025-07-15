import { Router } from 'express';
import register from '@/controllers/v1/auth/register';
import refreshTokenHandler from '@/controllers/v1/auth/refresh.token';
import { cookie } from 'express-validator';
import login from '@/controllers/v1/auth/login';
import authenticate from '@/middleware/authMiddleware';
import logout from '@/controllers/v1/auth/logout';
import verifyEmail from '@/controllers/v1/auth/verify';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/verify', verifyEmail);
router.post('/refresh-token', cookie('refreshToken'), refreshTokenHandler);
export default router;
