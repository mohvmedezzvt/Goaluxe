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
 * Retrieves all goals from the database.
 * @returns {Promise<Array>} - An array of goal documents.
 */
export const getGoals = async (userId) => {
  const goals = await Goal.find({ user: userId });
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
