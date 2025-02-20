import * as analyticsService from '../services/analyticsService.js';

/**
 * Returns lightweight dashboard analytics.
 * Metrics: Active Goals, Completed Goals, Overall Progress, and paginated Due Soon.
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dueSoonPage = Number(req.query.dueSoonPage) || 1;
    const dueSoonLimit = Number(req.query.dueSoonLimit) || 10;
    const analytics = await analyticsService.getDashboardAnalytics(
      userId,
      dueSoonPage,
      dueSoonLimit
    );
    res.status(200).json(analytics);
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
    const dueSoonPage = Number(req.query.dueSoonPage) || 1;
    const dueSoonLimit = Number(req.query.dueSoonLimit) || 10;
    const analytics = await analyticsService.getUserAnalytics(
      userId,
      dueSoonPage,
      dueSoonLimit
    );
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
