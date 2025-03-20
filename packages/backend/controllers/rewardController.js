import * as rewardService from '../services/rewardService.js';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

/**
 * Creates a new reward.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const createReward = async (req, res, next) => {
  try {
    const rewardData = { ...req.body, user: req.user.id };
    const reward = await rewardService.createReward(rewardData);
    res.status(201).json(reward);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all rewards for the authenticated user with pagination and filtering.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getRewards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = CacheKeys.REWARDS(userId, req.query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      res.locals.cacheHit = true;
      return res.status(200).json(cached);
    }

    const result = await rewardService.getRewards(userId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a specific reward by ID.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getRewardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Reward ID is required' });

    const cacheKey = CacheKeys.REWARD(id);
    const cachedReward = await redis.get(cacheKey);
    if (cachedReward) {
      res.locals.cacheHit = true;
      return res.status(200).json(cachedReward);
    }

    const reward = await rewardService.getRewardById(id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });

    if (reward.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You do not have access to this reward',
      });
    }

    await redis.set(cacheKey, reward, 600);
    res.status(200).json(reward);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a reward by ID.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const updateReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Reward ID is required' });

    const reward = await rewardService.getRewardById(id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });

    if (reward.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot update a reward that is not yours',
      });
    }

    const updatedReward = await rewardService.updateReward(id, req.body);
    res.status(200).json(updatedReward);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a reward by ID.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const deleteReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Reward ID is required' });

    const reward = await rewardService.getRewardById(id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });

    if (reward.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot delete a reward that is not yours',
      });
    }

    await rewardService.deleteReward(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Attaches a reward to a goal.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const attachRewardToGoal = async (req, res, next) => {
  try {
    const { rewardId, goalId } = req.params;

    if (!rewardId || !goalId) {
      return res.status(400).json({
        message: 'Reward ID and Goal ID are required',
      });
    }

    const updatedReward = await rewardService.attachRewardToGoal(
      rewardId,
      goalId
    );
    res.status(200).json(updatedReward);
  } catch (error) {
    next(error);
  }
};

/**
 * Detaches a reward from a goal.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const detachRewardFromGoal = async (req, res, next) => {
  try {
    const { rewardId, goalId } = req.params;

    if (!rewardId || !goalId) {
      return res.status(400).json({
        message: 'Reward ID and Goal ID are required',
      });
    }

    const updatedReward = await rewardService.detachRewardFromGoal(
      rewardId,
      goalId
    );
    res.status(200).json(updatedReward);
  } catch (error) {
    next(error);
  }
};

/**
 * Claims a reward if all attached goals are completed.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const claimReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Reward ID is required' });

    const reward = await rewardService.getRewardById(id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });

    if (reward.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot claim a reward that is not yours',
      });
    }

    const claimedReward = await rewardService.claimReward(id);
    res.status(200).json(claimedReward);
  } catch (error) {
    if (
      error.message.includes('Cannot claim reward') ||
      error.message.includes('already been claimed')
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Checks if a reward can be claimed.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const checkRewardClaimable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Reward ID is required' });

    const reward = await rewardService.getRewardById(id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });

    if (reward.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot access a reward that is not yours',
      });
    }

    const claimStatus = await rewardService.checkRewardClaimable(id);
    res.status(200).json(claimStatus);
  } catch (error) {
    next(error);
  }
};
