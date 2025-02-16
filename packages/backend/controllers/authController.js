import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from '../services/authService.js';

/**
 * Registers a new user.
 * Expects user data in req.body.
 * Validates required fields (username, email, password).
 * On success, returns a 201 response with the newly created user object (omitting the password).
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields.
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required',
      });
    }

    // Call the authentication service to register the user.
    const newUser = await registerUser({ username, email, password });

    // Return the created user with status 201.
    res.status(201).json(newUser);
  } catch (error) {
    // Propagate error to centralized error handler.
    next(error);
  }
};

/**
 * Logs in a user.
 * Expects login credentials (email, password) in req.body.
 * Validates required fields.
 * On success, returns a 200 response with a JWT token and basic user info.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields.
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Call the authentication service to log in the user.
    const result = await loginUser({ email, password });

    // Set refresh token in an HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    // Return the JWT token and user info with status 200.
    res.status(200).json({
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    // For authentication errors, return 401 Unauthorized.
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Refreshes an access token.
 * Expects a refresh token in req.body.
 * Validates required fields.
 * On success, returns a 200 response with a new JWT token.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Validate required fields.
    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required',
      });
    }

    // Call the authentication service to refresh the access token.
    const newToken = await refreshAccessToken(refreshToken);

    // Return the new JWT token with status 200.
    res.status(200).json(newToken);
  } catch (error) {
    res.clearCookie('refreshToken');
    next(error);
  }
};

// In-memory blacklist (use Redis for production)
export const tokenBlacklist = new Set();

export const logout = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(204).send(); // No content, already logged out
  }

  // Add token to blacklist
  tokenBlacklist.add(refreshToken);

  // Clear HTTP-only cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};
