import Reward from '../models/rewardModel.js';

/**
 * Retrieves all rewards that are public or that were created by the given user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - An array of Reward documents.
 */
export const getRewardOptions = async (userId) => {
  // Retrieve rewards that are either public or created by the user.
  const rewards = await Reward.find({
    $or: [{ public: true }, { createdBy: userId }],
  });
  return rewards;
};

/**
 * Creates a custom reward for the specified user.
 * This reward is marked as private (public: false) and is associated with the user.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} rewardData - An object containing the reward details.
 *   Expected fields include:
 *     - type: String (required, e.g., "points", "voucher", etc.)
 *     - value: Number (required for numeric reward types)
 *     - description: String (optional)
 *     - expiryDate: Date (optional)
 *     - redeemUrl: String (optional)
 *     - imageUrl: String (optional)
 *     - category: String (optional)
 * @returns {Promise<Object>} - The newly created Reward document.
 * @throws {Error} - Throws an error if required fields are missing.
 */
export const createCustomReward = async (
  userId,
  rewardData,
  userRole = 'user'
) => {
  // Validate that rewardData includes a reward type.
  if (!rewardData.type) {
    throw new Error('Reward type is required');
  }

  // If the user is not an admin, ignore any provided `public` field and force it to false.
  if (userRole !== 'admin') {
    rewardData.public = false;
  } else {
    // For admin users, if the `public` field is not provided, default it to true.
    if (typeof rewardData.public == 'undefined') {
      rewardData.public = true;
    }
  }

  rewardData.createdBy = userId;

  const newReward = await Reward.create(rewardData);
  return newReward;
};

/**
 * Updates a reward.
 * For public rewards, only admins are allowed to update.
 * For custom (private) rewards, only the creator can update.
 *
 * @param {string} rewardId - The ID of the reward to update.
 * @param {Object} updateData - The fields to update.
 * @param {string} userId - The ID of the authenticated user.
 * @param {string} userRole - The role of the authenticated user.
 * @returns {Promise<Object>} - The updated Reward document.
 * @throws {Error} - Throws an error if the reward is not found or if the user is not authorized.
 */
export const updateReward = async (rewardId, updateData, userId, userRole) => {
  const reward = await Reward.findById(rewardId);
  if (!reward) {
    throw new Error('Reward not found');
  }

  // Check ownership:
  if (reward.public) {
    // Only admins can update public rewards.
    if (userRole !== 'admin') {
      throw new Error('Forbidden: Cannot update public reward');
    }
  } else {
    // For custom rewards, only the creator may update.
    if (reward.createdBy.toString() !== userId) {
      throw new Error('Forbidden: You can only update your own rewards');
    }
  }

  // Prevent changes to the creator field.
  delete updateData.createdBy;

  const updatedReward = await Reward.findByIdAndUpdate(rewardId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedReward) {
    throw new Error('Reward not found');
  }
  return updatedReward;
};

/**
 * Deletes a reward.
 * For public rewards, only admins are allowed to delete.
 * For custom rewards, only the creator can delete.
 *
 * @param {string} rewardId - The ID of the reward to delete.
 * @param {string} userId - The ID of the authenticated user.
 * @param {string} userRole - The role of the authenticated user.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the reward is not found or if the user is not authorized.
 */
export const deleteReward = async (rewardId, userId, userRole) => {
  const reward = await Reward.findById(rewardId);
  if (!reward) {
    throw new Error('Reward not found');
  }

  // Check ownership:
  if (reward.public) {
    // Only admins can delete public rewards.
    if (userRole !== 'admin') {
      throw new Error('Forbidden: Cannot delete public reward');
    }
  } else {
    // For custom rewards, only the creator may delete.
    if (reward.createdBy.toString() !== userId) {
      throw new Error('Forbidden: You can only delete your own rewards');
    }
  }

  await Reward.findByIdAndDelete(rewardId);
};
