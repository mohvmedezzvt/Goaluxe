import * as userService from '../services/userService.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

// Mock the User model and bcrypt library
jest.mock('../models/userModel.js');
jest.mock('bcryptjs');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile without the password if user exists', async () => {
      const userId = '123';
      const mockUser = {
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };
      // Simulate User.findById().select('-password') chain:
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await userService.getUserProfile(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 'nonexistent';
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await expect(userService.getUserProfile(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should throw an error if updateData is empty', async () => {
      const userId = '123';
      await expect(userService.updateUserProfile(userId, {})).rejects.toThrow(
        'Update data is required'
      );
    });

    it('should update user profile and remove role and password fields from updateData', async () => {
      const userId = '123';
      const updateData = {
        username: 'newUser',
        role: 'admin',
        password: 'newPass',
      };
      // Expected updateData should remove role and password.
      const expectedData = { username: 'newUser' };

      const updatedUser = {
        _id: '123',
        username: 'newUser',
        email: 'test@example.com',
      };
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await userService.updateUserProfile(userId, updateData);
      expect(result).toEqual(updatedUser);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expectedData,
        { new: true, runValidators: true }
      );
    });

    it('should throw an error if user is not found during update', async () => {
      const userId = 'nonexistent';
      const updateData = { username: 'newUser' };
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await expect(
        userService.updateUserProfile(userId, updateData)
      ).rejects.toThrow('User not found');
    });
  });

  describe('changeUserPassword', () => {
    it('should throw an error if user is not found', async () => {
      const userId = 'nonexistent';
      User.findById.mockResolvedValue(null);
      await expect(
        userService.changeUserPassword(userId, 'currentPass', 'newPass')
      ).rejects.toThrow('User not found');
    });

    it('should throw an error if current password is incorrect', async () => {
      const userId = '123';
      const mockUser = { _id: '123', password: 'hashedPass' };
      User.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      await expect(
        userService.changeUserPassword(userId, 'wrongPass', 'newPass')
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should update the password if current password is correct', async () => {
      const userId = '123';
      // Create a mock user with a "save" method.
      const mockUser = {
        _id: '123',
        password: 'hashedPass',
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      const newHashedPassword = 'newHashedPass';
      bcrypt.hash.mockResolvedValue(newHashedPassword);

      const result = await userService.changeUserPassword(
        userId,
        'currentPass',
        'newPass'
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('currentPass', 'hashedPass');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPass', expect.any(Number));
      expect(mockUser.save).toHaveBeenCalled();
      // The returned user should have password undefined.
      expect(result.password).toBeUndefined();
    });
  });
});
