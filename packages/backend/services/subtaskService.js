import Subtask from '../models/subtaskModel.js';
import Goal from '../models/goalModel.js';
import { updateGoalProgress } from '../services/goalService.js';

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
 * Retrieve paginated subtasks for a specific goal with filtering, searching, and sorting.
 *
 * @param {string} goalId - The ID of the parent goal.
 * @param {Object} query - An object containing query parameters.
 *    - page: The page number (default: 1)
 *    - limit: The number of subtasks per page (default: 10, maximum: 50)
 *    - status: Filter by subtask status (e.g., 'pending', 'in-progress', 'completed', 'all' for no filtering)
 *    - title: Filter by partial title match (case-insensitive)
 *    - description: Filter by partial description match (case-insensitive)
 *    - fromDueDate: Filter subtasks with a dueDate on or after this date
 *    - toDueDate: Filter subtasks with a dueDate on or before this date
 *    - sortBy: Field to sort by ('dueDate', 'title', 'status', 'createdAt')
 *    - order: Sorting order ('asc' for ascending, 'desc' for descending)
 * @returns {Promise<Object>} - An object containing:
 *   - data: Array of subtask documents,
 *   - total: Total number of matching subtasks,
 *   - page: Current page number,
 *   - limit: Number of items per page,
 *   - totalPages: Total number of pages.
 * @throws {Error} - If the parent goal does not exist.
 */
export const getSubtasks = async (goalId, query = {}) => {
  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error('Parent goal not found');

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const maxLimit = 50;
  const limit = Math.min(parseInt(query.limit, 10) || 10, maxLimit);
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { goal: goalId };

  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.title) filter.title = { $regex: query.title, $options: 'i' };
  if (query.description)
    filter.description = { $regex: query.description, $options: 'i' };
  if (query.fromDueDate) filter.dueDate = { $gte: new Date(query.fromDueDate) };
  if (query.toDueDate)
    filter.dueDate = {
      ...(filter.dueDate || {}),
      $lte: new Date(query.toDueDate),
    };

  const total = await Subtask.countDocuments(filter);
  const validSortFields = ['dueDate', 'title', 'status', 'createdAt'];
  const sort = validSortFields.includes(query.sortBy)
    ? { [query.sortBy]: query.order === 'desc' ? -1 : 1 }
    : { createdAt: -1 }; // Default sort by creation date, newest first

  const subtasks = await Subtask.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    data: subtasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
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
