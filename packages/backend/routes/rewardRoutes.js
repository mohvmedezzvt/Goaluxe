// routes/rewardRoutes.js
import express from 'express';
import * as rewardController from '../controllers/rewardController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { checkBlacklist } from '../middleware/checkBlacklist.js';

const router = express.Router();

router.use(authMiddleware);
router.use(checkBlacklist);

// GET: Retrieve all available reward options (public rewards plus those created by the user)
router.get('/', rewardController.listRewardOptions);

// POST: Create a custom reward for the authenticated user
router.post('/', rewardController.createReward);

// PUT: Update an existing reward by its ID
router.put('/:id', rewardController.updateReward);

// DELETE: Delete a reward by its ID
router.delete('/:id', rewardController.deleteReward);

export default router;
