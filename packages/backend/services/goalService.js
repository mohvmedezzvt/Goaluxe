import Goal from '../models/goalModel.js';

/**
 * Creates a new goal in the database.
 * @param {Object} data - The goal data to create.
 * @return {Promise<Object>} - The newly created goal document.
 */
export const createGoal = async (data) => {
  // Business logic or additional validations can be added here.
  const goal = await Goal.create(data);
  return goal;
};

/**
 * Retrieves goals for a specific user with pagination and filtering.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} query - An object containing query parameters.
 *    - page: The page number (default: 1)
 *    - limit: The number of results per page (default: 10)
 *    - status: Filter by goal status (e.g., 'active', 'completed', 'cancelled')
 *    - title: Filter by partial title match (case-insensitive)
 *    - fromDueDate: Filter goals with a dueDate on or after this date
 *    - toDueDate: Filter goals with a dueDate on or before this date
 *
 * @returns {Promise<Array>} - An array of goal documents.
 */
export const getGoals = async (userId, query) => {
  // Parse pagination parameters from the query; default to page 1 and limit 10
  const page = parseInt(query.page, 10) || 1;
  const maxLimit = 100;
  const limit = Math.min(parseInt(query.limit, 10) || 10, maxLimit);
  const skip = (page - 1) * limit;

  // Build a filter object that always includes the authenticated user's goals
  const filter = { user: userId };

  // Optional filtering by status
  if (query.status) {
    filter.status = query.status;
  }

  // Optional filtering by title (case-insensitive, partial match)
  if (query.title) {
    filter.title = { $regex: query.title, $options: 'i' };
  }

  // Optional filtering by due date range
  if (query.fromDueDate) {
    filter.dueDate = { $gte: new Date(query.fromDueDate) };
  }
  if (query.toDueDate) {
    filter.dueDate = filter.dueDate || {};
    filter.dueDate.$lte = new Date(query.toDueDate);
  }

  const goals = await Goal.find(filter).skip(skip).limit(limit);
  return goals;
};

/**
 * Retrieves a goal by its unique ID.
 * @param {string} id - The ID of the goal.
 * @returns {Promise<Object|null>} - The goal document if found, or null.
 */
export const getGoalById = async (id) => {
  const goal = await Goal.findById(id);
  return goal;
};

/**
 * Updates a goal by its ID.
 * @param {string} id - The ID of the goal.
 * @param {Object} updateData - An object containing the updated fields.
 * @returns {Promise<Object|null>} - The updated goal document, or null if not found.
 */
export const updateGoal = async (id, updateData) => {
  // Option { new: true } returns the updated document.
  const updatedGoal = await Goal.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return updatedGoal;
};

/**
 * Deletes a goal by its ID.
 * @param {string} id - The ID of the goal.
 * @returns {Promise<void>}
 */
export const deleteGoal = async (id) => {
  await Goal.findByIdAndDelete(id);
};
