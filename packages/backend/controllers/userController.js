import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../services/userService.js';

/**
 * Retrieves the profile of the authenticated user.
 * Expects the authenticated user's ID to be present in req.user (populated by JWT verification middleware).
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getProfile = async (req, res, next) => {
  try {
    const cacheKey = CacheKeys.USER_PROFILE(req.user.id);
    const cached = await redis.get(cacheKey);
    res.locals.cacheHit = !!cached;
    if (cached) return res.status(200).json(cached);

    const profile = await getUserProfile(req.user.id);
    await redis.set(cacheKey, profile, 1800); // 30-minute TTL
    return res.status(200).json(profile);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Updates the profile of the authenticated user.
 * Extracts the user's ID from req.user and the update data from req.body.
 * Explicitly removes any attempt to update the 'role' field.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Prevent updating protected fields
    delete updateData.role;
    delete updateData.password;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }

    const updatedProfile = await updateUserProfile(userId, updateData);
    await redis.del(CacheKeys.USER_PROFILE(userId));
    return res.status(200).json(updatedProfile);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Update data is required') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Updates the password of the authenticated user.
 * Expects the currentPassword and newPassword in req.body.
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password are required' });
    }

    const updatedUser = await changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );
    await redis.del(CacheKeys.USER_PROFILE(userId));
    return res.status(200).json({
      message: 'Password updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({ message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
