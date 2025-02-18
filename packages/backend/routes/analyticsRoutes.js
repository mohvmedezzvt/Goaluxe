import express from 'express';
import {
  getDashboardAnalytics,
  getUserAnalytics,
} from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/analytics/dashboard - Lightweight dashboard analytics endpoint.
router.get('/dashboard', getDashboardAnalytics);

// GET /api/analytics/user - Full user analytics endpoint.
router.get('/user', getUserAnalytics);

export default router;
