/**
 * Middleware to validate the request body using a provided Joi schema.
 *
 * @param {Object} schema - A Joi schema object to validate the request body.
 * @returns {Function} An Express middleware function that validates req.body.
 *
 * The middleware validates the incoming request's body against the provided schema.
 * It uses the `abortEarly: false` option to collect all validation errors.
 * If validation fails, it responds with a 400 status code and a JSON containing the error details.
 * If validation passes, it calls the next middleware in the chain.
 */
export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: error.details.map((detail) => detail.message),
    });
  }
  next();
};
