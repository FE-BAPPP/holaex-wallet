import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;