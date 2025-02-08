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
    // Extract the authenticated user's ID from req.user
    const userId = req.user.id;

    // Fetch the user profile from the service layer (password is excluded)
    const profile = await getUserProfile(userId);

    // Return the profile with a 200 OK status
    res.status(200).json(profile);
  } catch (error) {
    // If the error indicates that the user was not found, return a 404 response
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    // Otherwise, pass the error to the centralized error handler
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

    // Remove the role field to prevent users from changing their role
    if ('role' in updateData) {
      delete updateData.role;
    }

    // Remove the password field to prevent users from changing their password
    if ('password' in updateData) {
      delete updateData.password;
    }

    // Optionally, validate that updateData contains keys
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }

    const updatedProfile = await updateUserProfile(userId, updateData);

    // Return the updated profile with a 200 OK status
    res.status(200).json(updatedProfile);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    // For invalid update data errors, return a 400 response
    if (error.message === 'Update data is required') {
      return res.status(400).json({ message: error.message });
    }
    // Otherwise, pass the error to the centralized error handler
    next(error);
  }
};

/**
 * Updates the password of the authenticated user.
 * Expects the currentPassword and newPassword in req.body.
 */
export const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

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
    res.status(200).json({
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
