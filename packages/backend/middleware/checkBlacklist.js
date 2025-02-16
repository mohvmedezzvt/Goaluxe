import { tokenBlacklist } from '../controllers/authController.js';

export const checkBlacklist = (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (tokenBlacklist.has(refreshToken)) {
    return res
      .status(401)
      .json({ message: 'Token is invalid. Please log in again.' });
  }

  next();
};
