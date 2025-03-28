/**
 * Mock In-Memory Database
 * This provides a simple in-memory database for testing the application
 * without requiring a MongoDB connection.
 */

import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(password: string): Promise<boolean>;
}

interface NecromancyRequest {
  _id: string;
  userId: string;
  userName: string;
  vehicleDescription: string;
  description: string;
  status: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

class MockDatabase {
  private users: User[] = [];
  private requests: NecromancyRequest[] = [];
  private userIdCounter: number = 1;
  private requestIdCounter: number = 1;

  constructor() {
    this.seedUsers();
    this.seedDemoRequests();
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u.email === email);
      return user || null;
    } catch (error) {
      logger.error('Error in mockDatabase.findUserByEmail:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const id = this.userIdCounter++;
      const now = new Date();
      
      // Add password comparison method
      const user: User = {
        _id: id.toString(),
        ...userData,
        createdAt: now,
        updatedAt: now,
        comparePassword: async function(password: string): Promise<boolean> {
          return bcrypt.compare(password, this.password);
        }
      };
      
      this.users.push(user);
      return user;
    } catch (error) {
      logger.error('Error in mockDatabase.createUser:', error);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u._id === id);
      return user || null;
    } catch (error) {
      logger.error('Error in mockDatabase.findUserById:', error);
      return null;
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      // Return shallow copy of users array without passwords
      return this.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });
    } catch (error) {
      logger.error('Error in mockDatabase.findAllUsers:', error);
      return [];
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const index = this.users.findIndex(u => u._id === id);
      if (index === -1) return null;
      
      this.users[index] = {
        ...this.users[index],
        ...userData,
        updatedAt: new Date()
      };
      
      return this.users[index];
    } catch (error) {
      logger.error('Error in mockDatabase.updateUser:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const initialLength = this.users.length;
      this.users = this.users.filter(u => u._id !== id);
      return initialLength > this.users.length;
    } catch (error) {
      logger.error('Error in mockDatabase.deleteUser:', error);
      return false;
    }
  }

  // NecromancyRequest methods
  async createRequest(requestData: Omit<NecromancyRequest, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<NecromancyRequest> {
    try {
      const id = this.requestIdCounter++;
      const now = new Date();
      
      const request: NecromancyRequest = {
        _id: id.toString(),
        ...requestData,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      
      this.requests.push(request);
      return request;
    } catch (error) {
      logger.error('Error in mockDatabase.createRequest:', error);
      throw error;
    }
  }

  async findRequestsByUserId(userId: string): Promise<NecromancyRequest[]> {
    try {
      return this.requests.filter(r => r.userId === userId);
    } catch (error) {
      logger.error('Error in mockDatabase.findRequestsByUserId:', error);
      return [];
    }
  }

  async findAllRequests(): Promise<NecromancyRequest[]> {
    try {
      return [...this.requests];
    } catch (error) {
      logger.error('Error in mockDatabase.findAllRequests:', error);
      return [];
    }
  }

  async findRequestById(id: string): Promise<NecromancyRequest | null> {
    try {
      const request = this.requests.find(r => r._id === id);
      return request || null;
    } catch (error) {
      logger.error('Error in mockDatabase.findRequestById:', error);
      return null;
    }
  }

  async updateRequestStatus(id: string, status: string, userId?: string): Promise<NecromancyRequest | null> {
    try {
      const index = this.requests.findIndex(r => r._id === id);
      if (index === -1) return null;
      
      // If userId is provided, ensure it matches the request's userId (for user-specific operations)
      if (userId && this.requests[index].userId !== userId) {
        const user = this.users.find(u => u._id === userId);
        if (user && ['admin', 'driver'].includes(user.role)) {
          // Admin and drivers can update any request
        } else {
          // Regular users can only update their own requests
          return null;
        }
      }
      
      this.requests[index] = {
        ...this.requests[index],
        status,
        updatedAt: new Date()
      };
      
      return this.requests[index];
    } catch (error) {
      logger.error('Error in mockDatabase.updateRequestStatus:', error);
      return null;
    }
  }

  // Seed the database with initial users
  private async seedUsers() {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      // Add test users if they don't exist
      if (!this.users.find(u => u.email === 'test@example.com')) {
        this.users.push({
          _id: '1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          comparePassword: async function(password: string): Promise<boolean> {
            return bcrypt.compare(password, this.password);
          }
        });
      }
      
      if (!this.users.find(u => u.email === 'driver@example.com')) {
        this.users.push({
          _id: '2',
          firstName: 'Test',
          lastName: 'Driver',
          email: 'driver@example.com',
          password: hashedPassword,
          role: 'driver',
          createdAt: new Date(),
          updatedAt: new Date(),
          comparePassword: async function(password: string): Promise<boolean> {
            return bcrypt.compare(password, this.password);
          }
        });
      }
      
      if (!this.users.find(u => u.email === 'admin@example.com')) {
        this.users.push({
          _id: '3',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          comparePassword: async function(password: string): Promise<boolean> {
            return bcrypt.compare(password, this.password);
          }
        });
      }
      
      this.userIdCounter = 4; // Set counter after seeding
    } catch (error) {
      logger.error('Error seeding users:', error);
    }
  }

  // Seed demo necromancy requests
  private async seedDemoRequests() {
    try {
      // Only seed if empty
      if (this.requests.length === 0) {
        this.requests.push({
          _id: '1',
          userId: '1',
          userName: 'Test User',
          vehicleDescription: 'Zombie Volkswagen Beetle',
          description: 'Engine makes groaning noises and leaks ectoplasm',
          status: 'pending',
          location: {
            address: '123 Haunted Lane, Spookytown',
            coordinates: [40.7128, -74.0060]
          },
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          updatedAt: new Date(Date.now() - 3600000)
        });
        
        this.requests.push({
          _id: '2',
          userId: '1',
          userName: 'Test User',
          vehicleDescription: 'Cursed Ford Pickup',
          description: 'Headlights flicker in morse code spelling "HELP"',
          status: 'accepted',
          location: {
            address: '456 Phantom Road, Ghostville',
            coordinates: [41.8781, -87.6298]
          },
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 43200000)  // 12 hours ago
        });
        
        this.requestIdCounter = 3; // Set counter after seeding
      }
    } catch (error) {
      logger.error('Error seeding demo requests:', error);
    }
  }
}

// Export a singleton instance
const mockDatabase = new MockDatabase();
export default mockDatabase; 