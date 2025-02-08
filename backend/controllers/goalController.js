import * as goalService from '../services/goalService.js';

/**
 * Creates a new goal.
 * Expects goal data in req.body.
 */
export const createGoal = async (req, res, next) => {
  try {
    const goalData = req.body;
    if (!goalData.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const goal = await goalService.createGoal(goalData);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all goals.
 */
export const getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getGoals();
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a specific goal by ID.
 * Expects goal ID in req.params.id.
 */
export const getGoalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }
    const goal = await goalService.getGoalById(id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a goal by ID.
 * Expects goal ID in req.params.id and updated data in req.body.
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }
    const updatedGoal = await goalService.updateGoal(id, updateData);
    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a goal by ID.
 * Expects goal ID in req.params.id.
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }
    await goalService.deleteGoal(id);
    // 204 No Content indicates successful deletion with no response body.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
