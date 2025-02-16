import express from 'express';
import * as goalController from '../controllers/goalController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  goalCreateSchema,
  goalUpdateSchema,
} from '../validators/goalValidator.js';
import { checkBlacklist } from '../middleware/checkBlacklist.js';

const router = express.Router();

router.use(authMiddleware);
router.use(checkBlacklist);

router.get('/', goalController.getGoals); // GET all goals
router.post('/', validateRequest(goalCreateSchema), goalController.createGoal); // Create a new goal
router.get('/:id', goalController.getGoalById); // Get a goal by ID
router.put(
  '/:id',
  validateRequest(goalUpdateSchema),
  goalController.updateGoal
); // Update a goal by ID
router.delete('/:id', goalController.deleteGoal); // Delete a goal by ID

export default router;
