import * as goalService from '../services/goalService.js';
import {
  goalCreateSchema,
  goalUpdateSchema,
} from '../validators/goalValidator.js';

/**
 * Creates a new goal.
 * Expects goal data in req.body.
 */
export const createGoal = async (req, res, next) => {
  try {
    // Validate request payload using Joi schema
    const { error, value } = goalCreateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: error.details.map((detail) => detail.message).join(', '),
      });
    }

    const goalData = value;

    goalData.user = req.user.id;

    if (goalData.rewardOptionId) {
      goalData.reward = goalData.rewardOptionId;
      delete goalData.rewardOptionId;
    }

    const goal = await goalService.createGoal(goalData);
    await goal.populate('reward');

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

    if (goal.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have accesss to this goal' });
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

    // Validate update payload; must contain at least one key
    const { error, value } = goalUpdateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: error.details.map((detail) => detail.message).join(', '),
      });
    }
    const updateData = value;

    if (!id) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }

    // If a rewardOptionId is provided, use it as the reward reference.
    if (updateData.rewardOptionId) {
      updateData.reward = updateData.rewardOptionId;
      delete updateData.rewardOptionId;
    }

    const goal = await goalService.getGoalById(id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You cannot update a goal that is not yours',
      });
    }

    const updatedGoal = await goalService.updateGoal(id, updateData);
    await updatedGoal.populate('reward');

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

    const goal = await goalService.getGoalById(id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    if (!goal.user || goal.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: 'Forbidden: You cannot delete a goal that is not yours',
        });
    }

    await goalService.deleteGoal(id);
    // 204 No Content indicates successful deletion with no response body.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
