import express from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/profile', authenticate as any, authController.updateProfile);

export default router;

