import express from 'express';
import * as rewardController from '../controllers/rewardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all reward routes
router.use(authMiddleware);

// Basic CRUD operations
router.post('/', rewardController.createReward);
router.get('/', rewardController.getRewards);
router.get('/:id', rewardController.getRewardById);
router.put('/:id', rewardController.updateReward);
router.delete('/:id', rewardController.deleteReward);

// Specialized reward operations
router.post('/:rewardId/goals/:goalId', rewardController.attachRewardToGoal);
router.delete(
  '/:rewardId/goals/:goalId',
  rewardController.detachRewardFromGoal
);
router.post('/:id/claim', rewardController.claimReward);
router.get('/:id/claimable', rewardController.checkRewardClaimable);

export default router;
