import Goal from '../models/goalModel.js';
import mongoose from 'mongoose';

// Maximum number of "Due Soon" goals allowed per page.
const MAX_DUE_SOON_LIMIT = 50;

/**
 * Computes common analytics metrics for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @param {number} dueSoonPage - Page number for due soon goals.
 * @param {number} dueSoonLimit - Limit for due soon goals per page.
 * @returns {Object} Common metrics along with totalCount and baseFilter for further calculations.
 */
const getCommonAnalytics = async (
  userId,
  dueSoonPage = 1,
  dueSoonLimit = 5
) => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  const baseFilter = { user: new mongoose.Types.ObjectId(userId) };

  // Active Goals Count
  const activeCount = await Goal.countDocuments({
    ...baseFilter,
    status: 'active',
  });

  // Completed Goals Count
  const completedCount = await Goal.countDocuments({
    ...baseFilter,
    status: 'completed',
  });

  // Total Goals Count
  const totalCount = await Goal.countDocuments({ ...baseFilter });

  // Overall Progress (average progress across all goals)
  const overallProgressAgg = await Goal.aggregate([
    { $match: baseFilter },
    { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
  ]);
  const overallProgress = overallProgressAgg[0]
    ? Number(overallProgressAgg[0].avgProgress.toFixed(2))
    : 0;

  dueSoonLimit = Math.min(dueSoonLimit, MAX_DUE_SOON_LIMIT);
  dueSoonPage = Math.max(Number(dueSoonPage) || 1, 1);

  // Due Soon: Count and paginated list of goals with dueDate within the next 7 days
  const dueSoonCount = await Goal.countDocuments({
    ...baseFilter,
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
  });
  const skip = (dueSoonPage - 1) * dueSoonLimit;
  const dueSoonGoals = await Goal.find({
    ...baseFilter,
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
  })
    .sort({ dueDate: 1 })
    .skip(skip)
    .limit(dueSoonLimit);

  return {
    activeCount,
    completedCount,
    overallProgress,
    dueSoonCount,
    dueSoonGoals,
    totalCount,
  };
};

/**
 * Computes additional analytics metrics for full user analytics.
 *
 * @param {Object} baseFilter - Filter based on the user.
 * @param {number} totalCount - Total number of goals for the user.
 * @returns {Object} Additional metrics.
 */
const getAdditionalAnalytics = async (baseFilter, totalCount) => {
  const now = new Date();

  // Overdue Goals: Count of goals past due and not completed.
  const overdueCount = await Goal.countDocuments({
    ...baseFilter,
    status: { $ne: 'completed' },
    dueDate: { $lt: now },
  });

  // Goals by Status Breakdown
  const statusBreakdownAgg = await Goal.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusBreakdown = {};
  statusBreakdownAgg.forEach((item) => {
    statusBreakdown[item._id] = item.count;
  });

  // Completion Rate: Percentage of goals completed out of total.
  const rawCompletionRate =
    totalCount > 0
      ? ((await Goal.countDocuments({ ...baseFilter, status: 'completed' })) /
          totalCount) *
        100
      : 0;

  const completionRate = Number(rawCompletionRate.toFixed(2));

  // Streaks/Consistency: (Placeholder, as this may require additional data or tracking logic)
  // soon

  return {
    overdueCount,
    statusBreakdown,
    completionRate,
  };
};

/**
 * Returns lightweight dashboard analytics.
 * Excludes additional internal metrics.
 */
export const getDashboardAnalytics = async (
  userId,
  dueSoonPage = 1,
  dueSoonLimit = 10
) => {
  const common = await getCommonAnalytics(userId, dueSoonPage, dueSoonLimit);
  // We remove totalCount and baseFilter from the response
  const {
    totalCount /* eslint-disable-line no-unused-vars */,
    baseFilter /* eslint-disable-line no-unused-vars */,
    ...dashboardAnalytics
  } = common;
  return dashboardAnalytics;
};

/**
 * Returns full user analytics (dashboard analytics plus additional metrics).
 */
export const getUserAnalytics = async (
  userId,
  dueSoonPage = 1,
  dueSoonLimit = 10
) => {
  const common = await getCommonAnalytics(userId, dueSoonPage, dueSoonLimit);
  const { totalCount, baseFilter, ...commonMetrics } = common;
  const additional = await getAdditionalAnalytics(baseFilter, totalCount);
  return { ...commonMetrics, ...additional };
};
