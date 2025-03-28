import TowingRequest, { ITowingRequest } from '../models/towingRequest.model';
import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Create a new towing request
 */
async function createTowingRequest(towingRequestData: any): Promise<ITowingRequest> {
  try {
    const towingRequest = new TowingRequest(towingRequestData);
    await towingRequest.save();
    return towingRequest;
  } catch (error: any) {
    logger.error(`Error in createTowingRequest service: ${error.message}`);
    throw error;
  }
}

/**
 * Get a towing request by ID
 */
async function getTowingRequestById(towingRequestId: string): Promise<ITowingRequest | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(towingRequestId)) {
      throw new Error('Invalid towing request ID');
    }
    
    const towingRequest = await TowingRequest.findById(towingRequestId);
    return towingRequest;
  } catch (error: any) {
    logger.error(`Error in getTowingRequestById service: ${error.message}`);
    throw error;
  }
}

/**
 * Update a towing request by ID
 */
async function updateTowingRequest(
  towingRequestId: string, 
  updatedData: any
): Promise<ITowingRequest | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(towingRequestId)) {
      throw new Error('Invalid towing request ID');
    }
    
    const updatedTowingRequest = await TowingRequest.findByIdAndUpdate(
      towingRequestId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );
    
    return updatedTowingRequest;
  } catch (error: any) {
    logger.error(`Error in updateTowingRequest service: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a towing request by ID
 */
async function deleteTowingRequest(towingRequestId: string): Promise<boolean> {
  try {
    if (!mongoose.Types.ObjectId.isValid(towingRequestId)) {
      throw new Error('Invalid towing request ID');
    }
    
    const result = await TowingRequest.findByIdAndDelete(towingRequestId);
    return !!result; // Convert to boolean
  } catch (error: any) {
    logger.error(`Error in deleteTowingRequest service: ${error.message}`);
    throw error;
  }
}

export default {
  createTowingRequest,
  getTowingRequestById,
  updateTowingRequest,
  deleteTowingRequest
};
