import Goal from '../models/goalModel.js';
import mongoose from 'mongoose';

// Common Analytics: shared between dashboard and full analytics.
const getCommonAnalytics = async (userId) => {
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

  // // Due Soon: Count and list of goals with dueDate within the next 7 days
  const dueSoonCount = await Goal.countDocuments({
    ...baseFilter,
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
  });
  const dueSoonGoals = await Goal.find({
    ...baseFilter,
    dueDate: { $gte: now, $lte: sevenDaysFromNow },
  });

  return {
    activeCount,
    completedCount,
    overallProgress,
    dueSoonCount,
    dueSoonGoals,
    totalCount,
    baseFilter,
  };
};

// Additional Analytics: only for the full user analytics endpoint.
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

// Exported functions:
// 1. getDashboardAnalytics: returns only common (lightweight) metrics.
// 2. getUserAnalytics: returns common metrics plus additional metrics.
//
export const getDashboardAnalytics = async (userId) => {
  const common = await getCommonAnalytics(userId);
  // We remove totalCount and baseFilter from the response
  const {
    totalCount /* eslint-disable-line no-unused-vars */,
    baseFilter /* eslint-disable-line no-unused-vars */,
    ...dashboardAnalytics
  } = common;
  return dashboardAnalytics;
};

export const getUserAnalytics = async (userId) => {
  const common = await getCommonAnalytics(userId);
  const { totalCount, baseFilter, ...commonMetrics } = common;
  const additional = await getAdditionalAnalytics(baseFilter, totalCount);
  return { ...commonMetrics, ...additional };
};
