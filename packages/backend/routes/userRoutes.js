import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { checkBlacklist } from '../middleware/checkBlacklist.js';

const router = express.Router();

router.use(authMiddleware);
router.use(checkBlacklist);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);

export default router;
