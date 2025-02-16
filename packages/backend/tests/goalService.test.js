import mongoose from 'mongoose';
import * as goalService from '../services/goalService.js';
import Goal from '../models/goalModel.js';

jest.mock('../models/goalModel.js');

describe('Goal Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('should create a new goal and return it', async () => {
      // Arrange: Define sample input and mock return value.
      const goalData = {
        title: 'Test Goal',
        description: 'This is a test goal',
        dueDate: new Date('2025-03-01'),
        reward: 'Ice cream',
        completed: false,
      };
      const createdGoal = { _id: '123', ...goalData };
      Goal.create.mockResolvedValue(createdGoal);

      // Act: Call the service.
      const result = await goalService.createGoal(goalData);

      // Assert: Ensure Goal.create was called with goalData and result is correct.
      expect(Goal.create).toHaveBeenCalledWith(goalData);
      expect(result).toEqual(createdGoal);
    });

    it('should propagate an error if creation fails', async () => {
      // Arrange
      const goalData = { title: 'Test Goal' };
      const errorMessage = 'Creation failed';
      Goal.create.mockRejectedValue(new Error(errorMessage));

      // Act & Assert: Expect the promise to reject with an error.
      await expect(goalService.createGoal(goalData)).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe('getGoals', () => {
    it('should return an array of goals with pagination metadata', async () => {
      // Arrange
      const userId = 'user123';
      const mockGoals = [
        { _id: '1', title: 'Goal 1', user: userId },
        { _id: '2', title: 'Goal 2', user: userId },
      ];
      // Create a chainable query object with sort, skip, and limit
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockGoals),
      };
      Goal.find.mockReturnValue(mockQuery);
      // Also mock countDocuments
      Goal.countDocuments.mockResolvedValue(2);

      // Define query parameters
      const query = {
        page: '1',
        limit: '10',
        sortBy: 'dueDate',
        order: 'asc',
      };

      // Act
      const result = await goalService.getGoals(userId, query);

      // Assert
      expect(Goal.find).toHaveBeenCalledWith({ user: userId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ dueDate: 1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(Goal.countDocuments).toHaveBeenCalledWith({ user: userId });

      expect(result).toEqual({
        data: mockGoals,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return an empty array with proper metadata if no goals exist', async () => {
      // Arrange
      const userId = 'user123';
      const mockGoals = [];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockGoals),
      };
      Goal.find.mockReturnValue(mockQuery);
      Goal.countDocuments.mockResolvedValue(0);

      const query = { page: '1', limit: '10' };

      // Act
      const result = await goalService.getGoals(userId, query);

      // Assert
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('getGoalById', () => {
    it('should return the goal when found', async () => {
      // Arrange
      const goal = { _id: '123', title: 'Found Goal' };
      Goal.findById.mockResolvedValue(goal);

      // Act
      const result = await goalService.getGoalById('123');

      // Assert
      expect(Goal.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(goal);
    });

    it('should return null when the goal is not found', async () => {
      // Arrange
      Goal.findById.mockResolvedValue(null);

      // Act
      const result = await goalService.getGoalById('nonexistent-id');

      // Assert
      expect(Goal.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateGoal', () => {
    it('should update the goal and return the updated document', async () => {
      // Arrange
      const updateData = { completed: true };
      const updatedGoal = { _id: '123', title: 'Test Goal', completed: true };
      Goal.findByIdAndUpdate.mockResolvedValue(updatedGoal);

      // Act
      const result = await goalService.updateGoal('123', updateData);

      // Assert
      expect(Goal.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData, {
        new: true,
      });
      expect(result).toEqual(updatedGoal);
    });

    it('should return null if the goal to update does not exist', async () => {
      // Arrange
      const updateData = { completed: true };
      Goal.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      const result = await goalService.updateGoal('nonexistent-id', updateData);

      // Assert
      expect(Goal.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistent-id',
        updateData,
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('deleteGoal', () => {
    it('should delete the goal', async () => {
      // Arrange
      Goal.findByIdAndDelete.mockResolvedValue();

      // Act
      await goalService.deleteGoal('123');

      // Assert
      expect(Goal.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should not throw an error if the goal does not exist', async () => {
      // Arrange
      Goal.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(
        goalService.deleteGoal('nonexistent-id')
      ).resolves.toBeUndefined();
      expect(Goal.findByIdAndDelete).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
});
