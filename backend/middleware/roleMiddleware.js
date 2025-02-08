/**
 * Role-based Access Control Middleware.
 * Returns a middleware function that checks if the authenticated user's role is allowed.
 *
 * @param {Array<string>} allowedRoles - Array of allowed roles (e.g., ["admin", "manager"])
 * @returns {Function} Express middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure that req.user exists (populated by authMiddleware)
    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not authenticated' });
    }

    // Check if the user's role is included in the allowedRoles array.
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient privileges' });
    }

    // If the user's role is allowed, continue to the next middleware/handler.
    next();
  };
};

export default authorize;
