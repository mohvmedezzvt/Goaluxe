import Subtask from '../models/subtaskModel.js';
import Goal from '../models/goalModel.js';
import { updateGoalProgress } from '../services/goalService.js';

const MAX_SUBTASK_LIMIT = 50;

/**
 * Create a new subtask for a given goal.
 *
 * @param {string} goalId - The ID of the parent goal.
 * @param {Object} subtaskData - The subtask data (title, description, dueDate, etc.).
 * @returns {Promise<Object>} - The newly created subtask.
 * @throws {Error} - If the parent goal does not exist.
 */
export const createSubtask = async (goalId, subtaskData) => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error('Parent goal not found');

  const subtask = await Subtask.create({ ...subtaskData, goal: goalId });
  await updateGoalProgress(goalId);
  return subtask;
};

/**
 * Retrieve paginated subtasks for a specific goal.
 *
 * @param {string} goalId - The ID of the parent goal.
 * @param {number} page - The page number (default is 1).
 * @param {number} limit - The number of subtasks per page (default is 10).
 * @returns {Promise<Object>} - An object containing paginated subtask data.
 * @throws {Error} - If the parent goal does not exist.
 */
export const getSubtasks = async (goalId, page = 1, limit = 10) => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error('Parent goal not found');

  limit = Math.min(limit, MAX_SUBTASK_LIMIT);
  page = Math.max(Number(page) || 1, 1);
  const skip = (page - 1) * limit;

  const total = await Subtask.countDocuments({ goal: goalId });
  const subtasks = await Subtask.find({ goal: goalId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: subtasks,
  };
};

/**
 * Retrieve a single subtask by its ID, ensuring it belongs to the specified goal.
 *
 * @param {string} goalId - The ID of the parent goal.
 * @param {string} subtaskId - The ID of the subtask.
 * @returns {Promise<Object>} - The subtask object.
 * @throws {Error} - If the subtask is not found.
 */
export const getSubtaskById = async (goalId, subtaskId) => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error('Parent goal not found');

  const subtask = await Subtask.findOne({ _id: subtaskId, goal: goalId });
  if (!subtask) throw new Error('Subtask not found');

  return subtask;
};

/**
 * Update a subtask for a given goal.
 *
 * @param {string} goalId - The ID of the parent goal.
 * @param {string} subtaskId - The ID of the subtask to update.
 * @param {Object} updateData - The fields to update (e.g., title, status, progress).
 * @returns {Promise<Object>} - The updated subtask object.
 * @throws {Error} - If the subtask is not found or update fails.
 */
export const updateSubtask = async (goalId, subtaskId, updateData) => {
  const subtask = await Subtask.findOneAndUpdate(
    { _id: subtaskId, goal: goalId },
    updateData,
    { new: true, runValidators: true }
  );
  if (!subtask) throw new Error('Subtask not found or update failed');

  await updateGoalProgress(goalId);
  return subtask;
};

/**
 * Delete a subtask from a given goal.
 *
 * @param {string} goalId - The ID of the parent goal.
 * @param {string} subtaskId - The ID of the subtask to delete.
 * @returns {Promise<void>}
 * @throws {Error} - If the subtask is not found or already deleted.
 */
export const deleteSubtask = async (goalId, subtaskId) => {
  const result = await Subtask.deleteOne({ _id: subtaskId, goal: goalId });
  if (result.deletedCount === 0) {
    throw new Error('Subtask not found or already deleted');
  }
  await updateGoalProgress(goalId);
};
