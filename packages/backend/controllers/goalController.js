import * as goalService from '../services/goalService.js';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

/**
 * Creates a new goal.
 * Expects goal data in req.body.
 */
export const createGoal = async (req, res, next) => {
  try {
    const goalData = { ...req.body, user: req.user.id };

    if (goalData.rewardOptionId) {
      goalData.reward = goalData.rewardOptionId;
      delete goalData.rewardOptionId;
    }

    const goal = await goalService.createGoal(goalData);
    await goal.populate('reward');

    // Invalidate caches for the user’s goals
    await redis.invalidateUser(goal.user.toString());
    await redis.del(CacheKeys.GOAL(goal._id));

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all goals for the authenticated user with pagination and filtering.
 */
export const getGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = CacheKeys.GOALS(userId, req.query);
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.locals.cacheHit = true;
      return res.status(200).json(cached);
    }

    const result = await goalService.getGoals(userId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a specific goal by ID.
 * Expects goal ID in req.params.id.
 */
export const getGoalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Goal ID is required' });

    const cacheKey = CacheKeys.GOAL(id);
    const cachedGoal = await redis.get(cacheKey);
    if (cachedGoal) {
      res.locals.cacheHit = true;
      return res.status(200).json(cachedGoal);
    }

    const goal = await goalService.getGoalById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (!goal.user || goal.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have access to this goal' });
    }

    await redis.set(cacheKey, goal, 600);
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a goal by ID.
 * Expects goal ID in req.params.id and updated data in req.body.
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Goal ID is required' });

    // Exclude auto-calculated fields like progress
    const { progress: _progress, ...updateData } = req.body;
    if (updateData.rewardOptionId) {
      updateData.reward = updateData.rewardOptionId;
      delete updateData.rewardOptionId;
    }

    const existingGoal = await goalService.getGoalById(id);
    if (!existingGoal)
      return res.status(404).json({ message: 'Goal not found' });
    if (existingGoal.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot update a goal that is not yours',
      });
    }

    await goalService.updateGoal(id, updateData);
    if (updateData.status) {
      await goalService.updateGoalProgress(id);
    }

    const refreshedGoal = await goalService.getGoalById(id);
    await refreshedGoal.populate('reward');
    res.status(200).json(refreshedGoal);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a goal by ID.
 * Expects goal ID in req.params.id.
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Goal ID is required' });

    const goal = await goalService.getGoalById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (!goal.user || goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot delete a goal that is not yours',
      });
    }

    await goalService.deleteGoal(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
