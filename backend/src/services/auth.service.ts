import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SanitizedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthResponse {
  user: SanitizedUser;
  token: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create new user with hashed password
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = generateToken(user._id.toString(), userData.role);

      return {
        user: this.sanitizeUser(user),
        token
      };
    } catch (error: any) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: loginData.email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Compare passwords
      const isPasswordMatch = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken(user._id.toString(), user.role);

      return {
        user: this.sanitizeUser(user),
        token
      };
    } catch (error: any) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Remove sensitive information from user object
   */
  private sanitizeUser(user: any): SanitizedUser {
    const { password, ...sanitizedUser } = user._id ? user.toObject ? user.toObject() : user : user;
    return sanitizedUser;
  }
}

export default new AuthService();
