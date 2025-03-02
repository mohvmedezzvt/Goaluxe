import Goal from '../models/goalModel.js';
import Subtask from '../models/subtaskModel.js';
import mongoose from 'mongoose';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

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

  // Basic goal counts
  const activeCount = await Goal.countDocuments({
    user: new mongoose.Types.ObjectId(userId),
    status: 'active',
  });
  const completedCount = await Goal.countDocuments({
    user: new mongoose.Types.ObjectId(userId),
    status: 'completed',
  });
  const totalCount = await Goal.countDocuments({ user: userId });

  // Calculate overall progress across all goals
  const overallProgressAgg = await Goal.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
  ]);
  const overallProgress = overallProgressAgg[0]
    ? Number(overallProgressAgg[0].avgProgress.toFixed(2))
    : 0;

  // Limit and pagination for due-soon subtasks
  dueSoonLimit = Math.min(dueSoonLimit, MAX_DUE_SOON_LIMIT);
  dueSoonPage = Math.max(Number(dueSoonPage) || 1, 1);
  const skip = (dueSoonPage - 1) * dueSoonLimit;

  // Get all goal IDs for the user
  const userGoals = await Goal.find({ user: userId }).select('_id');
  const goalIds = userGoals.map((goal) => goal._id);

  // Identify goals with subtasks due soon
  const dueSoonGoalIds = await Subtask.distinct('goal', {
    goal: { $in: goalIds },
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
    status: { $ne: 'completed' },
  });
  const dueSoonCount = dueSoonGoalIds.length;

  // Get the due soon subtasks with pagination
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

  const overdueCount = await Goal.countDocuments({
    ...baseFilter,
    status: { $ne: 'completed' },
    dueDate: { $lt: now },
  });

  const statusBreakdownAgg = await Goal.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusBreakdown = {};
  statusBreakdownAgg.forEach((item) => {
    statusBreakdown[item._id] = item.count;
  });

  const completedGoals = await Goal.countDocuments({
    ...baseFilter,
    status: 'completed',
  });
  const rawCompletionRate =
    totalCount > 0 ? (completedGoals / totalCount) * 100 : 0;
  const completionRate = Number(rawCompletionRate.toFixed(2));

  return { overdueCount, statusBreakdown, completionRate };
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
  const cacheKey = CacheKeys.ANALYTICS_DASHBOARD(userId);
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const common = await getCommonAnalytics(userId, dueSoonPage, dueSoonLimit);
  // Exclude internal values that are not needed on the dashboard
  const { totalCount, ...dashboardAnalytics } = common;

  try {
    await redis.set(cacheKey, dashboardAnalytics, 600);
    await redis.trackKey(userId, cacheKey);
  } catch (error) {
    console.error('Dashboard analytics cache write error:', error);
  }
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
