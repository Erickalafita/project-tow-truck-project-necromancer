import { Request, Response } from 'express';
import userService from '../services/user.service';
import logger from '../utils/logger';

// Extend the Request type to include the user property from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

class UserController {
  /**
   * Get all users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: (error as Error).message
      });
    }
  }

  /**
   * Create new user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      // Check if user with email already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      const user = await userService.createUser({
        firstName,
        lastName,
        email,
        password
      });

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const { firstName, lastName, email } = req.body;

      const user = await userService.updateUser(userId, {
        firstName,
        lastName,
        email
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: (error as Error).message
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const deleted = await userService.deleteUser(userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: (error as Error).message
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      // Assuming you have user info in req.user from the auth middleware
      if (req.user) {
        const user = await userService.getUserById(req.user.userId);
        if(user){
            res.json(user);
        } else {
            res.status(400).json({ message: 'User not defined'})
        }
      } else {
        logger.warn('User id issue')
        res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error:any) {
      logger.error(`Could not getting the user`, {error}) // Error for the log
      res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      // Assuming you have user info in req.user from the auth middleware
      if (req.user) {
        const userId = req.user.userId;
        const updateData = req.body;
        const updatedUser = await userService.updateUser(userId, updateData);
        res.json(updatedUser);
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error:any) {
      logger.error(`Could not updating user`, {error}) // Error for the log
      res.status(500).json({ message: error.message });
    }
  }
}

export default new UserController();
