import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

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
  // Find the user by ID and exclude the password field.
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

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
  // Validate that updateData is provided and is not empty.
  if (
    !updateData ||
    typeof updateData !== 'object' ||
    Object.keys(updateData).length === 0
  ) {
    throw new Error('Update data is required');
  }

  // Remove the role field if present, to prevent users from updating their role.
  if ('role' in updateData) {
    delete updateData.role;
  }

  // Remove the password field if present, to prevent users from updating their password.
  if ('password' in updateData) {
    delete updateData.password;
  }

  // Update the user document; runValidators ensures the update is validated against the schema.
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password'); // Exclude the password from the returned document.

  if (!updatedUser) {
    throw new Error('User not found');
  }

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
  // Retrieve the user by ID (password field included)
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Compare the provided current password with the stored hashed password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password = hashedPassword;
  await user.save();

  // Remove the password field before returning the user document
  user.password = undefined;
  return user;
};
