import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config(); // Load environment variables from .env

// Use MongoDB Atlas free tier connection string if available, otherwise use local
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/project_necromancer';

let isConnected = false;

async function connectDB() {
  // If we're already connected, return
  if (isConnected) {
    logger.info('MongoDB connection already established');
    return;
  }

  try {
    // Set strictQuery to false to prepare for Mongoose 7 default
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoUri);
    isConnected = true;
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.warn('⚠️ MongoDB connection error:' + error);
    logger.info('👉 Using in-memory mock database instead');
    // Don't exit the process, let the app continue with the mock database
  }
}

export default connectDB;
export { isConnected }; 