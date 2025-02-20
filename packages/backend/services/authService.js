import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const JWT_REFRESH_EXPIRES_IN = '15d';

/**
 * Registers a new user.
 * Validates input, checks for duplicate username/email, hashes the password, and creates a user document.
 *
 * @param {Object} userData - The registration data.
 * @param {string} userData.username - The desired username.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.password - The user's password (plain text; will be hashed).
 * @param {string} [userData.role] - (Optional) The user's role (e.g., "user", "admin").
 * @returns {Promise<Object>} - The newly created user document (password field omitted).
 * @throws {Error} - Throws an error if required fields are missing or if a user already exists.
 */
export const registerUser = async (userData) => {
  const { username, email, password } = userData;

  // Validate required fields.
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }

  // Check if a user with the provided email or username already exists.
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new Error(
      'A user with the provided email or username already exists'
    );
  }

  // Hash the password.
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create the user document.
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role: 'user',
  });

  // Remove the password field from the returned user.
  newUser.password = undefined;
  return newUser;
};

/**
 * Logs in a user.
 * Verifies the email exists, compares the provided password with the stored hashed password,
 * and generates a JWT token upon successful authentication.
 *
 * @param {Object} credentials - The login credentials.
 * @param {string} credentials.email - The user's email address.
 * @param {string} credentials.password - The plain-text password.
 * @returns {Promise<Object>} - An object containing the JWT token and user details (excluding password).
 * @throws {Error} - Throws an error if email or password is missing or if authentication fails.
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Validate required fields.
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find the user by email.
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare the provided password with the stored hashed password.
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate access and refresh tokens.
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return {
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
};

/**
 * Refreshes an access token using a refresh token.
 * @param {string} refreshToken - The refresh token provided by the client.
 * @returns {Promise<Object>} - An object containing a new access token.
 * @throws {Error} - Throws an error if the refresh token is invalid or expired.
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { token: newAccessToken };
  } catch (error /* eslint-disable-line no-unused-vars */) {
    throw new Error('Invalid or expired refresh token');
  }
};
