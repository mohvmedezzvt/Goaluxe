import {
  getRewardOptions,
  createCustomReward,
  updateReward as updateRewardService,
  deleteReward as deleteRewardService,
} from '../services/rewardService.js';

/**
 * Retrieves a list of reward options.
 * This returns rewards that are public and rewards created by the authenticated user.
 *
 * Expects the authenticated user's ID in req.user (populated by authMiddleware).
 */
export const listRewardOptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rewards = await getRewardOptions(userId);
    res.status(200).json(rewards);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a custom reward for the authenticated user.
 * Expects reward data in req.body.
 *
 * Required field:
 *   - type (e.g., "points", "voucher", "badge", etc.)
 *
 * Marks the reward as private (public: false) and associates it with the user.
 */
export const createReward = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const rewardData = req.body;

    if (!rewardData.type) {
      return res.status(400).json({ message: 'Reward type is required' });
    }

    const newReward = await createCustomReward(userId, rewardData, userRole);
    res.status(201).json(newReward);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing reward.
 * Expects the reward ID in req.params.id and update data in req.body.
 * Checks that only authorized users (admins for public rewards, creator for custom rewards) can update.
 */
export const updateReward = async (req, res, next) => {
  try {
    const rewardId = req.params.id;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }

    const updatedReward = await updateRewardService(
      rewardId,
      updateData,
      userId,
      userRole
    );
    res.status(200).json(updatedReward);
  } catch (error) {
    if (error.message === 'Reward not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.startsWith('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Deletes a reward.
 * Expects the reward ID in req.params.id.
 * Checks that only authorized users (admins for public rewards, creator for custom rewards) can delete.
 */
export const deleteReward = async (req, res, next) => {
  try {
    const rewardId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    await deleteRewardService(rewardId, userId, userRole);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Reward not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.startsWith('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};
