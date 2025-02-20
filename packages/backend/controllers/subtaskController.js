import * as subtaskService from '../services/subtaskService.js';

/**
 * Create a new subtask for a specified goal.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const createSubtask = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const subtask = await subtaskService.createSubtask(goalId, req.body);
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve paginated subtasks for a given goal.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getSubtasks = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await subtaskService.getSubtasks(goalId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a single subtask by its ID.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getSubtaskById = async (req, res, next) => {
  try {
    const { goalId, subtaskId } = req.params;
    const subtask = await subtaskService.getSubtaskById(goalId, subtaskId);
    res.status(200).json(subtask);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a subtask for a specified goal.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const updateSubtask = async (req, res, next) => {
  try {
    const { goalId, subtaskId } = req.params;
    const updatedSubtask = await subtaskService.updateSubtask(
      goalId,
      subtaskId,
      req.body
    );
    res.status(200).json(updatedSubtask);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a subtask from a specified goal.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const deleteSubtask = async (req, res, next) => {
  try {
    const { goalId, subtaskId } = req.params;
    await subtaskService.deleteSubtask(goalId, subtaskId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
