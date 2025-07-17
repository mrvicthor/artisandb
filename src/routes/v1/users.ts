import { getUser } from '@/controllers/v1/users/get.user';
import { getUsers } from '@/controllers/v1/users/get.users';
import authenticate from '@/middleware/authMiddleware';
import authorizeRole from '@/middleware/authorizeRole';
import { Router } from 'express';

const router = Router();
router.get('/', authenticate, authorizeRole(['admin']), getUsers);
router.get('/:id', authenticate, authorizeRole(['admin']), getUser);
export default router;
