import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import redis from '../config/redis.js';
import { CacheKeys } from '../utils/cacheKeys.js';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

/**
 * Retrieves the user profile by userId.
 * Excludes sensitive fields (e.g., password) before returning the data.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The user profile document (without the password).
 * @throws {Error} - Throws an error if the user is not found.
 */
export const getUserProfile = async (userId) => {
  const cacheKey = CacheKeys.USER_PROFILE(userId);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch (err) {
    console.error('Cache read failed, falling back to DB', err);
  }

  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw new Error('User not found');

  await redis.set(cacheKey, user, 1800); // 30-minute TTL
  await redis.trackKey(userId, cacheKey);
  return user;
};

/**
 * Updates the user profile.
 * Validates updateData and explicitly ignores the role field to prevent privilege escalation.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} updateData - An object containing the fields to update.
 * @returns {Promise<Object>} - The updated user profile (without the password).
 * @throws {Error} - Throws an error if updateData is invalid or the user is not found.
 */
export const updateUserProfile = async (userId, updateData) => {
  if (
    !updateData ||
    typeof updateData !== 'object' ||
    Object.keys(updateData).length === 0
  ) {
    throw new Error('Update data is required');
  }

  // Remove protected fields
  delete updateData.role;
  delete updateData.password;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) throw new Error('User not found');

  await redis.del(CacheKeys.USER_PROFILE(userId));
  return updatedUser;
};

/**
 * Changes the user's password.
 * Retrieves the user by ID, compares the provided current password with the stored hashed password,
 * hashes the new password, updates the user record, and returns the updated user profile.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} currentPassword - The user's current (plain-text) password.
 * @param {string} newPassword - The new (plain-text) password to set.
 * @returns {Promise<Object>} - The updated user document (without the password).
 * @throws {Error} - Throws an error if the user is not found or if the current password is incorrect.
 */
export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  user.password = undefined; // Remove sensitive field before returning
  return user;
};
