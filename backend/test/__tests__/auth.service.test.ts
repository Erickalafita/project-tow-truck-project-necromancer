import authService from '../../src/services/auth.service';
import User from '../../src/models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../src/models/user.model'); // Mock the User model
jest.mock('bcryptjs'); // Mock bcryptjs
jest.mock('jsonwebtoken'); // Mock jsonwebtoken

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client',
      };

      const hashedPassword = 'hashedPassword';
      const mockSalt = 'mockSalt';
      
      // Fix the mock setup
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        ...userData,
        _id: '123',
        password: hashedPassword, // This is the hashed password stored in DB
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({
          ...userData,
          _id: '123',
          password: hashedPassword
        })
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const authResponse = await authService.register(userData);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, mockSalt);
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      
      // Password should not be included in the response
      expect(authResponse).toEqual({
        user: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          _id: '123',
        },
        token: 'mocked_token'
      });
    });

    it('should throw an error if user registration fails', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client',
      };

      (User.create as jest.Mock).mockRejectedValue(new Error('Registration failed'));

      await expect(authService.register(userData)).rejects.toThrow('Registration failed');
    });
  });

  describe('loginUser', () => {
    it('should login an existing user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      // Mock bcrypt.compare to return true for successful password match
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const mockUser:any = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword, // Stored hashed password
        role: 'client',
        _id: '123',
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          role: 'client', // No password here (sanitized)
          _id: '123',
        })
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const authResponse = await authService.login(loginData);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, hashedPassword);
      expect(authResponse).toEqual({
        user: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          role: 'client',
          _id: '123',
        },
        token: 'mocked_token'
      });
    });

    it('should throw an error if user login fails (invalid credentials)', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const hashedPassword = 'hashedPassword';
      // Mock bcrypt.compare to return false for failed password match
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const mockUser:any = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'client',
        _id: '123',
        save: jest.fn(),
        toObject: jest.fn()
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error if user does not exist', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });
});
