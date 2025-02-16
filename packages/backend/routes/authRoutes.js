import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { checkBlacklist } from '../middleware/checkBlacklist.js';

const router = express.Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', checkBlacklist, authController.refreshToken);
router.post('/logout', checkBlacklist, authController.logout);

export default router;
