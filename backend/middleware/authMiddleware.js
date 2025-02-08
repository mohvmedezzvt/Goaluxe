import jwt from 'jsonwebtoken';

/**
 * JWT Verification Middleware
 * Extracts the token from the Authorization header, verifies it,
 * and attaches the decoded user data to req.user.
 *
 * Expected header format: Authorization: Bearer <token>
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Next middleware function.
 */
const authMiddleware = (req, res, next) => {
  // Extract the Authorization header
  const authHeader = req.headers.authorization;

  // If header is missing or doesn't start with "Bearer", return 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Authorization token missing or malformed' });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded payload (user data) to the request object
    req.user = decoded;
    // Proceed to the next middleware or controller
    next();
  } catch (error /* eslint-disable-line no-unused-vars */) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
