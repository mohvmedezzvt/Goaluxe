import Goal from '../models/goalModel.js';
import Subtask from '../models/subtaskModel.js';
import mongoose from 'mongoose';

// Maximum number of "Due Soon" goals allowed per page.
const MAX_DUE_SOON_LIMIT = 50;

/**
 * Computes common analytics metrics for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @param {number} dueSoonPage - Page number for due soon subtasks.
 * @param {number} dueSoonLimit - Limit for due soon subtasks per page.
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

  // Active Goals Count
  const activeCount = await Goal.countDocuments({
    user: new mongoose.Types.ObjectId(userId),
    status: 'active',
  });

  // Completed Goals Count
  const completedCount = await Goal.countDocuments({
    user: new mongoose.Types.ObjectId(userId),
    status: 'completed',
  });

  // Total Goals Count
  const totalCount = await Goal.countDocuments({ user: userId });

  // Overall Progress (average progress across all goals)
  const overallProgressAgg = await Goal.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
  ]);
  const overallProgress = overallProgressAgg[0]
    ? Number(overallProgressAgg[0].avgProgress.toFixed(2))
    : 0;

  dueSoonLimit = Math.min(dueSoonLimit, MAX_DUE_SOON_LIMIT);
  dueSoonPage = Math.max(Number(dueSoonPage) || 1, 1);
  const skip = (dueSoonPage - 1) * dueSoonLimit;

  // Find all goals that belong to the user
  const userGoals = await Goal.find({ user: userId }).select('_id');
  const goalIds = userGoals.map((goal) => goal._id);

  const dueSoonGoalIds = await Subtask.distinct('goal', {
    goal: { $in: goalIds },
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
    status: { $ne: 'completed' },
  });

  const dueSoonCount = dueSoonGoalIds.length;

  const dueSoonSubtasks = await Subtask.find({
    goal: { $in: dueSoonGoalIds },
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
    status: { $ne: 'completed' },
  })
    .sort({ dueDate: 1 })
    .skip(skip)
    .limit(dueSoonLimit);

  return {
    activeCount,
    completedCount,
    overallProgress,
    dueSoonCount,
    dueSoonSubtasks,
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
  const { totalCount, ...commonMetrics } = common;
  const additional = await getAdditionalAnalytics({ user: userId }, totalCount);
  return { ...commonMetrics, ...additional };
};
