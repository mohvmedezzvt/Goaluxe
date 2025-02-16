import express from 'express';
import * as authController from '../controllers/authController.js';
import { checkBlacklist } from '../middleware/checkBlacklist.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', checkBlacklist, authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
