import { Router } from 'express';
import WithdrawalController from '../controllers/WithdrawalController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes
router.use(authMiddleware);

router.post('/request', WithdrawalController.requestWithdrawal);
router.get('/history', WithdrawalController.getUserWithdrawals);

// Admin routes
router.get('/pending', WithdrawalController.getPendingWithdrawals);
router.post('/approve/:withdrawalId', WithdrawalController.approveWithdrawal);

export default router;