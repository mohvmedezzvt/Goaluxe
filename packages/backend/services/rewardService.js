import Reward from '../models/rewardModel.js';
import Goal from '../models/goalModel.js';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

/**
 * Creates a new reward.
 * @param {Object} data - The reward data.
 * @returns {Promise<Object>} - The newly created reward.
 */
export const createReward = async (data) => {
  return await Reward.create(data);
};

/**
 * Get all rewards for a specific user with pagination, filtering, and sorting.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} query - Query parameters for filtering, pagination, and sorting.
 * @returns {Promise<Object>} - Paginated rewards data.
 */
export const getRewards = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const maxLimit = 50;
  const limit = Math.min(parseInt(query.limit, 10) || 10, maxLimit);
  const skip = (page - 1) * limit;

  const filter = { user: userId };

  // Apply filters
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.name) filter.name = { $regex: query.name, $options: 'i' };
  if (query.goalId) filter.goals = { $in: [query.goalId] };

  // Count total documents matching the filter
  const total = await Reward.countDocuments(filter);

  // Define sort order
  const sort =
    query.sortBy && ['createdAt', 'name', 'status'].includes(query.sortBy)
      ? {
          [query.sortBy]:
            query.order && query.order.toLowerCase() === 'desc' ? -1 : 1,
        }
      : { createdAt: -1 };

  // Get paginated rewards
  const rewards = await Reward.find(filter).sort(sort).skip(skip).limit(limit);

  const result = {
    data: rewards,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Cache the result
  try {
    const cacheKey = CacheKeys.REWARDS(userId, query);
    await redis.set(cacheKey, result, 600); // TTL: 10 minutes
    await redis.trackKey(userId, cacheKey);
  } catch (error) {
    console.error('Cache write error:', error);
  }

  return result;
};

/**
 * Get a specific reward by ID.
 *
 * @param {string} id - The reward ID.
 * @returns {Promise<Object|null>} - The reward or null if not found.
 */
export const getRewardById = async (id) => {
  return await Reward.findById(id).populate('goals');
};

/**
 * Updates a reward.
 *
 * @param {string} id - The reward ID.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Object|null>} - The updated reward or null if not found.
 */
export const updateReward = async (id, updateData) => {
  const reward = await Reward.findByIdAndUpdate(id, updateData, { new: true });

  if (reward) {
    try {
      await Promise.all([
        redis.invalidateUser(reward.user.toString()),
        redis.del(CacheKeys.REWARD(id)),
        // If goals array changed, invalidate associated goal caches
        ...(updateData.goals
          ? updateData.goals.map((goalId) => redis.del(CacheKeys.GOAL(goalId)))
          : []),
      ]);
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  return reward;
};

/**
 * Deletes a reward.
 *
 * @param {string} id - The reward ID.
 * @returns {Promise<boolean>} - True if deleted, false otherwise.
 */
export const deleteReward = async (id) => {
  const reward = await Reward.findById(id);
  if (!reward) return false;

  // Store user ID and goals for cache invalidation
  const userId = reward.user;
  const goalIds = reward.goals || [];

  // Remove reward reference from associated goals
  await Goal.updateMany({ _id: { $in: goalIds } }, { $set: { reward: null } });

  // Delete the reward
  await Reward.findByIdAndDelete(id);

  // Invalidate caches
  try {
    await Promise.all([
      redis.invalidateUser(userId.toString()),
      redis.del(CacheKeys.REWARD(id)),
      ...goalIds.map((goalId) => redis.del(CacheKeys.GOAL(goalId))),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }

  return true;
};

/**
 * Attaches a reward to a goal.
 *
 * @param {string} rewardId - The reward ID.
 * @param {string} goalId - The goal ID.
 * @returns {Promise<Object>} - The updated reward.
 */
export const attachRewardToGoal = async (rewardId, goalId) => {
  const reward = await Reward.findById(rewardId);
  if (!reward) throw new Error('Reward not found');

  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error('Goal not found');

  // Check if user owns both the reward and the goal
  if (reward.user.toString() !== goal.user.toString()) {
    throw new Error('User does not own both the reward and the goal');
  }

  // Add goal to reward if not already attached
  if (!reward.goals.includes(goalId)) {
    reward.goals.push(goalId);
    await reward.save();
  }

  // Update goal to reference this reward
  await Goal.findByIdAndUpdate(goalId, { reward: rewardId });

  // Invalidate caches
  try {
    await Promise.all([
      redis.invalidateUser(reward.user.toString()),
      redis.del(CacheKeys.REWARD(rewardId)),
      redis.del(CacheKeys.GOAL(goalId)),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }

  return reward;
};

/**
 * Detaches a reward from a goal.
 *
 * @param {string} rewardId - The reward ID.
 * @param {string} goalId - The goal ID.
 * @returns {Promise<Object>} - The updated reward.
 */
export const detachRewardFromGoal = async (rewardId, goalId) => {
  const reward = await Reward.findById(rewardId);
  if (!reward) throw new Error('Reward not found');

  // Remove goal from reward's goals array
  reward.goals = reward.goals.filter((id) => id.toString() !== goalId);
  await reward.save();

  // Remove reward reference from the goal
  await Goal.findByIdAndUpdate(goalId, { reward: null });

  // Invalidate caches
  try {
    await Promise.all([
      redis.invalidateUser(reward.user.toString()),
      redis.del(CacheKeys.REWARD(rewardId)),
      redis.del(CacheKeys.GOAL(goalId)),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }

  return reward;
};

/**
 * Claims a reward if all attached goals are completed.
 *
 * @param {string} rewardId - The reward ID.
 * @returns {Promise<Object>} - The updated reward with claim status.
 */
export const claimReward = async (rewardId) => {
  const reward = await Reward.findById(rewardId).populate('goals');
  if (!reward) throw new Error('Reward not found');

  if (reward.status === 'claimed') {
    throw new Error('Reward has already been claimed');
  }

  // If no goals are attached, allow claiming
  if (!reward.goals.length) {
    reward.status = 'claimed';
    reward.claimedAt = new Date();
    await reward.save();
    return reward;
  }

  // Check if all attached goals are completed
  const allGoalsCompleted = reward.goals.every(
    (goal) => goal.status === 'completed'
  );

  if (!allGoalsCompleted) {
    throw new Error('Cannot claim reward: not all goals are completed');
  }

  // Update reward as claimed
  reward.status = 'claimed';
  reward.claimedAt = new Date();
  await reward.save();

  // Invalidate caches
  try {
    await Promise.all([
      redis.invalidateUser(reward.user.toString()),
      redis.del(CacheKeys.REWARD(rewardId)),
      ...reward.goals.map((goal) => redis.del(CacheKeys.GOAL(goal._id))),
    ]);
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }

  return reward;
};

/**
 * Checks if a reward can be claimed (all attached goals are completed).
 *
 * @param {string} rewardId - The reward ID.
 * @returns {Promise<Object>} - Object containing claimable status and reason.
 */
export const checkRewardClaimable = async (rewardId) => {
  const reward = await Reward.findById(rewardId).populate('goals');
  if (!reward) throw new Error('Reward not found');

  if (reward.status === 'claimed') {
    return {
      claimable: false,
      reason: 'Reward has already been claimed',
    };
  }

  // If no goals are attached, reward is claimable
  if (!reward.goals.length) {
    return { claimable: true };
  }

  // Check if all attached goals are completed
  const allGoalsCompleted = reward.goals.every(
    (goal) => goal.status === 'completed'
  );

  if (!allGoalsCompleted) {
    const incompleteGoals = reward.goals
      .filter((goal) => goal.status !== 'completed')
      .map((goal) => goal.title);

    return {
      claimable: false,
      reason: 'Not all goals are completed',
      incompleteGoals,
    };
  }

  return { claimable: true };
};
