// tests/rewardService.test.js
import * as rewardService from '../services/rewardService.js';
import Reward from '../models/rewardModel.js';

jest.mock('../models/rewardModel.js');

describe('Reward Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRewardOptions', () => {
    it('should return rewards that are public or created by the given user', async () => {
      // Arrange
      const userId = 'user123';
      const mockRewards = [
        { _id: 'r1', public: true },
        { _id: 'r2', public: false, createdBy: userId },
      ];
      Reward.find.mockResolvedValue(mockRewards);

      // Act
      const result = await rewardService.getRewardOptions(userId);

      // Assert
      expect(Reward.find).toHaveBeenCalledWith({
        $or: [{ public: true }, { createdBy: userId }],
      });
      expect(result).toEqual(mockRewards);
    });
  });

  describe('createCustomReward', () => {
    it('should force public to false for non-admin users even if provided as true', async () => {
      // Arrange
      const userId = 'user123';
      const userRole = 'user';
      const rewardData = {
        type: 'points',
        value: 100,
        description: '100 points reward',
        public: true, // attempt to mark as public
      };
      const expectedData = {
        ...rewardData,
        public: false, // forced to false for non-admin users
        createdBy: userId,
      };
      const createdReward = { _id: 'r1', ...expectedData };

      Reward.create.mockResolvedValue(createdReward);

      // Act
      const result = await rewardService.createCustomReward(
        userId,
        rewardData,
        userRole
      );

      // Assert
      expect(Reward.create).toHaveBeenCalledWith(expectedData);
      expect(result).toEqual(createdReward);
    });

    it('should default public to true for admin users if not provided', async () => {
      // Arrange
      const userId = 'admin123';
      const userRole = 'admin';
      const rewardData = {
        type: 'voucher',
        description: '10% discount voucher',
      };
      const expectedData = {
        ...rewardData,
        public: true, // default to true for admin when not provided
        createdBy: userId,
      };
      const createdReward = { _id: 'r2', ...expectedData };

      Reward.create.mockResolvedValue(createdReward);

      // Act
      const result = await rewardService.createCustomReward(
        userId,
        rewardData,
        userRole
      );

      // Assert
      expect(Reward.create).toHaveBeenCalledWith(expectedData);
      expect(result).toEqual(createdReward);
    });

    it('should allow an admin to explicitly set public to false', async () => {
      // Arrange
      const userId = 'admin123';
      const userRole = 'admin';
      const rewardData = {
        type: 'badge',
        description: 'Exclusive badge',
        public: false,
      };
      const expectedData = {
        ...rewardData,
        createdBy: userId,
      };
      const createdReward = { _id: 'r3', ...expectedData };

      Reward.create.mockResolvedValue(createdReward);

      // Act
      const result = await rewardService.createCustomReward(
        userId,
        rewardData,
        userRole
      );

      // Assert
      expect(Reward.create).toHaveBeenCalledWith(expectedData);
      expect(result).toEqual(createdReward);
    });

    it('should throw an error if reward type is missing', async () => {
      // Arrange
      const userId = 'user123';
      const userRole = 'user';
      const rewardData = {
        value: 100,
        description: 'No type provided',
      };

      // Act & Assert
      await expect(
        rewardService.createCustomReward(userId, rewardData, userRole)
      ).rejects.toThrow('Reward type is required');
    });
  });
  describe('updateReward', () => {
    it('should update a public reward if the user is admin', async () => {
      // Arrange
      const rewardId = 'r1';
      const userId = 'admin123';
      const userRole = 'admin';
      const updateData = { description: 'Updated description' };
      const reward = { _id: rewardId, public: true, createdBy: null };
      const updatedReward = {
        _id: rewardId,
        public: true,
        createdBy: null,
        ...updateData,
      };

      Reward.findById.mockResolvedValue(reward);
      Reward.findByIdAndUpdate.mockReturnValue(updatedReward);

      // Act
      const result = await rewardService.updateReward(
        rewardId,
        updateData,
        userId,
        userRole
      );

      // Assert
      expect(Reward.findByIdAndUpdate).toHaveBeenCalledWith(
        rewardId,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedReward);
    });

    it('should throw an error when a non-admin tries to update a public reward', async () => {
      // Arrange
      const rewardId = 'r1';
      const userId = 'user123';
      const userRole = 'user';
      const updateData = { description: 'Attempted update' };
      const reward = { _id: rewardId, public: true, createdBy: null };

      Reward.findById.mockResolvedValue(reward);

      // Act & Assert
      await expect(
        rewardService.updateReward(rewardId, updateData, userId, userRole)
      ).rejects.toThrow('Forbidden: Cannot update public reward');
    });

    it('should update a custom reward if the user is the creator', async () => {
      // Arrange
      const rewardId = 'r2';
      const userId = 'user123';
      const userRole = 'user';
      const updateData = { description: 'Updated custom reward' };
      const reward = { _id: rewardId, public: false, createdBy: userId };
      const updatedReward = {
        _id: rewardId,
        public: false,
        createdBy: userId,
        ...updateData,
      };

      Reward.findById.mockResolvedValue(reward);
      Reward.findByIdAndUpdate.mockReturnValue(updatedReward);

      // Act
      const result = await rewardService.updateReward(
        rewardId,
        updateData,
        userId,
        userRole
      );

      // Assert
      expect(Reward.findByIdAndUpdate).toHaveBeenCalledWith(
        rewardId,
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedReward);
    });

    it('should throw an error when a user tries to update a custom reward they do not own', async () => {
      // Arrange
      const rewardId = 'r2';
      const userId = 'user123';
      const userRole = 'user';
      const updateData = { description: 'Unauthorized update' };
      const reward = { _id: rewardId, public: false, createdBy: 'otherUser' };

      Reward.findById.mockResolvedValue(reward);

      // Act & Assert
      await expect(
        rewardService.updateReward(rewardId, updateData, userId, userRole)
      ).rejects.toThrow('Forbidden: You can only update your own rewards');
    });
  });

  describe('deleteReward', () => {
    it('should delete a public reward if the user is admin', async () => {
      // Arrange
      const rewardId = 'r1';
      const userId = 'admin123';
      const userRole = 'admin';
      const reward = { _id: rewardId, public: true, createdBy: null };

      Reward.findById.mockResolvedValue(reward);
      Reward.findByIdAndDelete.mockResolvedValue();

      // Act & Assert
      await expect(
        rewardService.deleteReward(rewardId, userId, userRole)
      ).resolves.toBeUndefined();
      expect(Reward.findByIdAndDelete).toHaveBeenCalledWith(rewardId);
    });

    it('should throw an error when a non-admin tries to delete a public reward', async () => {
      // Arrange
      const rewardId = 'r1';
      const userId = 'user123';
      const userRole = 'user';
      const reward = { _id: rewardId, public: true, createdBy: null };

      Reward.findById.mockResolvedValue(reward);

      // Act & Assert
      await expect(
        rewardService.deleteReward(rewardId, userId, userRole)
      ).rejects.toThrow('Forbidden: Cannot delete public reward');
    });

    it('should delete a custom reward if the user is the creator', async () => {
      // Arrange
      const rewardId = 'r2';
      const userId = 'user123';
      const userRole = 'user';
      const reward = { _id: rewardId, public: false, createdBy: userId };

      Reward.findById.mockResolvedValue(reward);
      Reward.findByIdAndDelete.mockResolvedValue();

      // Act & Assert
      await expect(
        rewardService.deleteReward(rewardId, userId, userRole)
      ).resolves.toBeUndefined();
      expect(Reward.findByIdAndDelete).toHaveBeenCalledWith(rewardId);
    });

    it('should throw an error when a user tries to delete a custom reward they do not own', async () => {
      // Arrange
      const rewardId = 'r2';
      const userId = 'user123';
      const userRole = 'user';
      const reward = { _id: rewardId, public: false, createdBy: 'otherUser' };

      Reward.findById.mockResolvedValue(reward);

      // Act & Assert
      await expect(
        rewardService.deleteReward(rewardId, userId, userRole)
      ).rejects.toThrow('Forbidden: You can only delete your own rewards');
    });
  });
});
