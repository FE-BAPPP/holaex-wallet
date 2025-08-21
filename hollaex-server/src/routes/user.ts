import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes
router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.get('/balance', UserController.getBalance);
router.get('/transactions', UserController.getTransactions);

export default router;