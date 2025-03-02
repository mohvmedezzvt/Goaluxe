import Goal from '../models/goalModel.js';
import Subtask from '../models/subtaskModel.js';
import mongoose from 'mongoose';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

/**
 * Creates a new goal in the database.
 * @param {Object} data - The goal data to create.
 * @return {Promise<Object>} - The newly created goal document.
 */
export const createGoal = async (data) => {
  return await Goal.create(data);
};

/**
 * Retrieves goals for a specific user with pagination, filtering, and sorting.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} query - An object containing query parameters.
 *    - page: The page number (default: 1)
 *    - limit: The number of results per page (default: 10, maximum: 100)
 *    - status: Filter by goal status (e.g., 'active', 'completed', 'cancelled', 'all' for no filtering)
 *    - title: Filter by partial title match (case-insensitive)
 *    - fromDueDate: Filter goals with a dueDate on or after this date
 *    - toDueDate: Filter goals with a dueDate on or before this date
 *    - sortBy: Field to sort by ('dueDate', 'progress', 'title')
 *    - order: Sorting order ('asc' for ascending, 'desc' for descending)
 *
 * @returns {Promise<Object>} - An object containing:
 *   - data: Array of goal documents,
 *   - total: Total number of matching goals,
 *   - page: Current page number,
 *   - limit: Number of items per page,
 *   - totalPages: Total number of pages.
 */
export const getGoals = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const maxLimit = 50;
  const limit = Math.min(parseInt(query.limit, 10) || 10, maxLimit);
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (query.status) filter.status = query.status;
  if (query.title) filter.title = { $regex: query.title, $options: 'i' };
  if (query.fromDueDate) filter.dueDate = { $gte: new Date(query.fromDueDate) };
  if (query.toDueDate) {
    filter.dueDate = filter.dueDate || {};
    filter.dueDate.$lte = new Date(query.toDueDate);
  }

  const total = await Goal.countDocuments(filter);
  const sort =
    query.sortBy && ['dueDate', 'progress', 'title'].includes(query.sortBy)
      ? {
          [query.sortBy]:
            query.order && query.order.toLowerCase() === 'desc' ? -1 : 1,
        }
      : { createdAt: -1 };

  const goals = await Goal.find(filter).sort(sort).skip(skip).limit(limit);
  const result = {
    data: goals,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  try {
    const cacheKey = CacheKeys.GOALS(userId, query);
    await redis.set(cacheKey, result, 600);
    await redis.trackKey(userId, cacheKey);
  } catch (error) {
    console.error('Cache write error:', error);
  }

  return result;
};

/**
 * Retrieves a goal by its unique ID.
 * @param {string} id - The ID of the goal.
 * @returns {Promise<Object|null>} - The goal document if found, or null.
 */
export const getGoalById = async (id) => {
  return await Goal.findById(id);
};

/**
 * Updates a goal by its ID.
 * @param {string} id - The ID of the goal.
 * @param {Object} updateData - An object containing the updated fields.
 * @returns {Promise<Object|null>} - The updated goal document, or null if not found.
 */
export const updateGoal = async (id, updateData) => {
  const updatedGoal = await Goal.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  try {
    await Promise.all([
      redis.invalidateUser(updatedGoal.user.toString()),
      redis.del(CacheKeys.GOAL(id)),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
  return updatedGoal;
};

/**
 * Recalculates the overall progress of a goal based on its subtasks,
 * and updates the goal document in the database.
 *
 * @param {string} goalId - The ID of the goal.
 * @returns {Promise<number>} - The new calculated progress value (rounded to two decimals).
 */
export const updateGoalProgress = async (goalId) => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error('Goal not found');

  const subtaskCount = await Subtask.countDocuments({
    goal: new mongoose.Types.ObjectId(goalId),
  });

  let newProgress = 0;
  if (subtaskCount === 0) {
    newProgress = goal.status === 'completed' ? 100 : 0;
  } else {
    const aggregation = await Subtask.aggregate([
      { $match: { goal: new mongoose.Types.ObjectId(goalId) } },
      {
        $group: {
          _id: '$goal',
          avgProgress: { $avg: { $ifNull: ['$progress', 0] } },
        },
      },
    ]);
    newProgress =
      aggregation.length > 0
        ? Number(aggregation[0].avgProgress.toFixed(2))
        : 0;
  }

  await Goal.findByIdAndUpdate(goalId, { progress: newProgress });
  try {
    await Promise.all([
      redis.invalidateUser(goal.user.toString()),
      redis.del(CacheKeys.GOAL(goalId)),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
  return newProgress;
};

/**
 * Deletes a goal by its ID.
 * @param {string} id - The ID of the goal.
 * @returns {Promise<void>}
 */
export const deleteGoal = async (id) => {
  const goal = await Goal.findById(id);
  if (!goal) throw new Error('Goal not found');

  await Goal.findByIdAndDelete(id);
  try {
    await Promise.all([
      redis.invalidateUser(goal.user.toString()),
      redis.del(CacheKeys.GOAL(id)),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
};
