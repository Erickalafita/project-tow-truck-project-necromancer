import NecromancyRequest, { INecromancyRequest } from '../models/necromancyRequest.model';
import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Get a necromancy request by ID
 */
async function getNecromancyRequestById(requestId: string): Promise<INecromancyRequest | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new Error('Invalid necromancy request ID');
    }
    
    const request = await NecromancyRequest.findById(requestId);
    return request;
  } catch (error: any) {
    logger.error(`Error in getNecromancyRequestById service: ${error.message}`);
    throw error;
  }
}

/**
 * Create a new necromancy request
 */
async function createNecromancyRequest(requestData: any): Promise<INecromancyRequest> {
  try {
    const request = new NecromancyRequest(requestData);
    await request.save();
    return request;
  } catch (error: any) {
    logger.error(`Error in createNecromancyRequest service: ${error.message}`);
    throw error;
  }
}

/**
 * Update a necromancy request by ID
 */
async function updateNecromancyRequest(
  requestId: string, 
  updateData: any
): Promise<INecromancyRequest | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new Error('Invalid necromancy request ID');
    }
    
    const updatedRequest = await NecromancyRequest.findByIdAndUpdate(
      requestId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return updatedRequest;
  } catch (error: any) {
    logger.error(`Error in updateNecromancyRequest service: ${error.message}`);
    throw error;
  }
}

/**
 * Get all necromancy requests
 */
async function getAllNecromancyRequests(): Promise<INecromancyRequest[]> {
  try {
    const requests = await NecromancyRequest.find();
    return requests;
  } catch (error: any) {
    logger.error(`Error in getAllNecromancyRequests service: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a necromancy request by ID
 */
async function deleteNecromancyRequest(requestId: string): Promise<boolean> {
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new Error('Invalid necromancy request ID');
    }
    
    const result = await NecromancyRequest.findByIdAndDelete(requestId);
    return !!result; // Convert to boolean
  } catch (error: any) {
    logger.error(`Error in deleteNecromancyRequest service: ${error.message}`);
    throw error;
  }
}

export default {
  getNecromancyRequestById,
  createNecromancyRequest,
  updateNecromancyRequest,
  getAllNecromancyRequests,
  deleteNecromancyRequest
}; 