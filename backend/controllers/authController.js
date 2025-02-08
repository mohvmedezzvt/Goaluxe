import { registerUser, loginUser } from '../services/authService.js';

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
    const { username, email, password, role } = req.body;

    // Validate required fields.
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required',
      });
    }

    // Call the authentication service to register the user.
    const newUser = await registerUser({ username, email, password, role });

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

    // Return the JWT token and user info with status 200.
    res.status(200).json(result);
  } catch (error) {
    // For authentication errors, return 401 Unauthorized.
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};
