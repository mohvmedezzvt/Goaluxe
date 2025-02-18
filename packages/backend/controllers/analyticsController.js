import * as analyticsService from '../services/analyticsService.js';

/**
 * Returns lightweight dashboard analytics.
 * Metrics: Active Goals, Completed Goals, Overall Progress, Due Soon.
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analytics = await analyticsService.getDashboardAnalytics(userId);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns full user analytics.
 * Metrics: All dashboard analytics plus Overdue Goals, Goals by Status Breakdown, Completion Rate, and Streaks.
 */
export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analytics = await analyticsService.getUserAnalytics(userId);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
