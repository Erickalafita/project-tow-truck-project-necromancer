import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { isConnected } from '../config/database';
import mockDatabase from './mockDatabase';

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Store hashed passwords
  role: string; // e.g., "user", "driver", "admin"
  comparePassword(password: string): Promise<boolean>; // Method to compare passwords
  // Add other user fields as needed
}

// Only create the Mongoose model if MongoDB is connected
const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'customer', 'driver', 'admin'],
    default: 'user'
  },
  // Add other user fields as needed
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Hash the password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Create a User interface that can be used with both Mongoose and mock database
interface UserModel {
  findOne(query: any): Promise<any>;
  create(userData: any): Promise<any>;
  findById(id: string): Promise<any>;
  find(): { select(fields: string): Promise<any[]> };
  findByIdAndUpdate(id: string, data: any, options: any): Promise<any>;
  findByIdAndDelete(id: string): Promise<any>;
}

// Create a wrapper that will use either Mongoose or mockDatabase
const getUserModel = (): UserModel => {
  if (isConnected) {
    // Use Mongoose model if MongoDB is connected
    return mongoose.model<IUser>('User', UserSchema);
  } else {
    // Otherwise, use the mock database
    return {
      async findOne(query: any) {
        if (query.email) {
          return await mockDatabase.findUserByEmail(query.email);
        }
        return null;
      },
      async create(userData: any) {
        return await mockDatabase.createUser(userData);
      },
      async findById(id: string) {
        return await mockDatabase.findUserById(id);
      },
      find() {
        return {
          select(fields: string) {
            // Return all users with password field omitted
            return Promise.resolve([]);
          }
        };
      },
      async findByIdAndUpdate(id: string, data: any, options: any) {
        // Mock implementation - could be expanded
        return null;
      },
      async findByIdAndDelete(id: string) {
        // Mock implementation - could be expanded
        return null;
      }
    };
  }
};

export default getUserModel();
