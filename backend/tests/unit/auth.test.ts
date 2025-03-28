import authService from '../../src/services/auth.service';
import User from '../../src/models/user.model';
import bcrypt from 'bcryptjs';
import * as jwt from '../../src/utils/jwt';

// Mock dependencies
jest.mock('../../src/models/user.model');
jest.mock('bcryptjs');
jest.mock('../../src/utils/jwt');

describe('Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup mock data
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      };
      
      const hashedPassword = 'hashedpassword123';
      const userId = 'user123';
      const token = 'jwt-token-123';
      
      // Mock findOne to return null (no existing user)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock bcrypt methods
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      // Mock User.create
      const mockUserDocument = {
        _id: userId,
        ...registerData,
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          role: registerData.role,
          password: hashedPassword
        })
      };
      (User.create as jest.Mock).mockResolvedValue(mockUserDocument);
      
      // Mock generateToken
      (jwt.generateToken as jest.Mock).mockReturnValue(token);
      
      // Call the method
      const result = await authService.register(registerData);
      
      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ email: registerData.email });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 'salt');
      expect(User.create).toHaveBeenCalledWith({
        ...registerData,
        password: hashedPassword
      });
      expect(jwt.generateToken).toHaveBeenCalledWith(userId, registerData.role);
      
      // Check the result structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', token);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual({
        _id: userId,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        role: registerData.role
      });
    });

    it('should throw error if user already exists', async () => {
      // Setup
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: 'user'
      };
      
      // Mock findOne to return an existing user
      (User.findOne as jest.Mock).mockResolvedValue({ email: registerData.email });
      
      // Call and assert
      await expect(authService.register(registerData)).rejects.toThrow('User with this email already exists');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      // Setup mock data
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };
      
      const userId = 'user123';
      const hashedPassword = 'hashedpassword123';
      const token = 'jwt-token-123';
      const role = 'user';
      
      // Mock user document
      const mockUserDocument = {
        _id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: loginData.email,
        password: hashedPassword,
        role: role,
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          firstName: 'John',
          lastName: 'Doe',
          email: loginData.email,
          password: hashedPassword,
          role: role
        })
      };
      
      // Mock findOne to return a user
      (User.findOne as jest.Mock).mockResolvedValue(mockUserDocument);
      
      // Mock bcrypt.compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      // Mock generateToken
      (jwt.generateToken as jest.Mock).mockReturnValue(token);
      
      // Call the method
      const result = await authService.login(loginData);
      
      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, hashedPassword);
      expect(jwt.generateToken).toHaveBeenCalledWith(userId, role);
      
      // Check the result structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', token);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual({
        _id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: loginData.email,
        role: role
      });
    });

    it('should throw error if email is invalid', async () => {
      // Setup
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // Mock findOne to return null (no user found)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call and assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      // Setup
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };
      
      const mockUserDocument = {
        _id: 'user123',
        email: loginData.email,
        password: 'hashedpassword123'
      };
      
      // Mock findOne to return a user
      (User.findOne as jest.Mock).mockResolvedValue(mockUserDocument);
      
      // Mock bcrypt.compare to return false (password doesn't match)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      // Call and assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(jwt.generateToken).not.toHaveBeenCalled();
    });
  });
}); 