import express from 'express';
import * as subtaskController from '../controllers/subtaskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createSubtaskSchema,
  updateSubtaskSchema,
} from '../validators/subtaskValidator.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Create a subtask for a goal
router.post(
  '/',
  validateRequest(createSubtaskSchema),
  subtaskController.createSubtask
);

// Get paginated subtasks for a goal
router.get('/', subtaskController.getSubtasks);

// Get a specific subtask by ID for a goal
router.get('/:subtaskId', subtaskController.getSubtaskById);

// Update a subtask for a goal
router.patch(
  '/:subtaskId',
  validateRequest(updateSubtaskSchema),
  subtaskController.updateSubtask
);

// Delete a subtask for a goal
router.delete('/:subtaskId', subtaskController.deleteSubtask);

export default router;
