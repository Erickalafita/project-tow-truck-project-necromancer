import User from '../models/user.model';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

// Add this type for Mongoose queries
type MongooseQuery = mongoose.Query<any, any> & Promise<any>;

interface UserCreateData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: UserCreateData): Promise<Document> {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<Document[]> {
    try {
      const users = await User.find().select('-password'); // Exclude password field
      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Document | null> {
    try {
      // Cast to MongooseQuery to fix the TypeScript error
      const user = await (User.findById(userId) as MongooseQuery).select('-password');
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<Document | null> {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateData: UserUpdateData): Promise<Document | null> {
    try {
      // Cast to MongooseQuery to fix the TypeScript error
      const user = await (User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ) as MongooseQuery).select('-password');
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
