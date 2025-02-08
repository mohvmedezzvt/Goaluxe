import express from 'express';
import * as goalController from '../controllers/goalController.js';

const router = express.Router();

router.get('/', goalController.getGoals); // GET all goals
router.post('/', goalController.createGoal); // Create a new goal
router.get('/:id', goalController.getGoalById); // Get a goal by ID
router.put('/:id', goalController.updateGoal); // Update a goal by ID
router.delete('/:id', goalController.deleteGoal); // Delete a goal by ID

export default router;
