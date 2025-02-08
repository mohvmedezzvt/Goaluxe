import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authService from '../services/authService.js';
import User from '../models/userModel.js';

// Mock the User model and external libraries
jest.mock('../models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should throw an error if required fields are missing', async () => {
      const incompleteData = { email: 'test@test.com' };
      await expect(authService.registerUser(incompleteData)).rejects.toThrow(
        'Username, email, and password are required'
      );
    });

    it('should throw an error if a user with the same email or username exists', async () => {
      // Arrange: simulate an existing user.
      const existingUser = {
        _id: '123',
        email: 'test@test.com',
        username: 'testuser',
      };
      User.findOne.mockResolvedValue(existingUser);

      const userData = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password',
      };

      // Act & Assert: registration should fail.
      await expect(authService.registerUser(userData)).rejects.toThrow(
        'A user with the provided email or username already exists'
      );
    });

    it('should create a new user with hashed password', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null); // No existing user
      const plainPassword = 'password123';
      const hashedPassword = 'hashed123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const userData = {
        email: 'test@test.com',
        username: 'testuser',
        password: plainPassword,
        role: 'user',
      };

      const createdUser = {
        _id: '123',
        email: 'test@test.com',
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
      };

      User.create.mockResolvedValue(createdUser);

      // Act
      const result = await authService.registerUser(userData);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(
        plainPassword,
        expect.any(Number)
      );
      expect(User.create).toHaveBeenCalledWith({
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('loginUser', () => {
    it('should throw an error if email or password is missing', async () => {
      await expect(
        authService.loginUser({ email: 'test@test.com' })
      ).rejects.toThrow('Email and password are required');
    });

    it('should throw an error if user is not found', async () => {
      // Arrange: simulate no user found for the email.
      User.findOne.mockResolvedValue(null);
      await expect(
        authService.loginUser({
          email: 'nonexistent@test.com',
          password: 'password',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw an error if password does not match', async () => {
      // Arrange: simulate a found user but with mismatched password.
      const user = {
        _id: '123',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'user',
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.loginUser({
          email: 'test@test.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return a token and user details on successful login', async () => {
      // Arrange: simulate a user with a matching password.
      const user = {
        _id: '123',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedPassword',
        role: 'user',
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const fakeToken = 'fake.jwt.token';
      jwt.sign.mockReturnValue(fakeToken);

      const credentials = {
        email: 'test@test.com',
        password: 'correctpassword',
      };

      // Act
      const result = await authService.loginUser(credentials);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentials.password,
        user.password
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: fakeToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    });
  });
});
