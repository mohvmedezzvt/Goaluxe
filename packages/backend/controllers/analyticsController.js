import * as analyticsService from '../services/analyticsService.js';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

/**
 * Returns lightweight dashboard analytics.
 * Metrics: Active Goals, Completed Goals, Overall Progress, and paginated Due Soon.
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = CacheKeys.ANALYTICS_DASHBOARD(userId);
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.locals.cacheHit = true;
      return res.status(200).json(cached);
    }

    const analytics = await analyticsService.getDashboardAnalytics(
      userId,
      Number(req.query.dueSoonPage) || 1,
      Number(req.query.dueSoonLimit) || 10
    );

    // Cache for 10 minutes
    await redis.set(cacheKey, analytics, 600).catch(console.error);
    return res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns full user analytics.
 * Metrics: All dashboard analytics plus Overdue Goals, Goals by Status Breakdown, and Completion Rate.
 */
export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = CacheKeys.ANALYTICS(userId, 'user');
    const analytics = await analyticsService.getUserAnalytics(
      userId,
      Number(req.query.dueSoonPage) || 1,
      Number(req.query.dueSoonLimit) || 10
    );

    // Cache for 5 minutes
    await redis.set(cacheKey, analytics, 300);
    return res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
