import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mockDatabase from '../models/mockDatabase';
import { isConnected } from '../config/database';
import logger from '../utils/logger';

/**
 * Create a new necromancy (tow) request
 */
async function createRequest(req: AuthRequest, res: Response) {
  try {
    const { vehicleDescription, description, location } = req.body;
    const userId = req.user?.userId;
    const userName = req.user?.name || 'Unknown User';

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Validate request data
    if (!vehicleDescription || !description || !location) {
      return res.status(400).json({ 
        message: 'Vehicle description, problem description, and location are required' 
      });
    }

    // Create the request
    const newRequest = await mockDatabase.createRequest({
      userId,
      userName,
      vehicleDescription,
      description,
      status: 'pending',
      location: {
        address: location.address || 'Unknown location',
        coordinates: location.coordinates || { lat: 0, lng: 0 }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    logger.info(`New necromancy request created by user ${userId}`);
    res.status(201).json(newRequest);
  } catch (error: any) {
    logger.error(`Error creating necromancy request: ${error.message}`, { error });
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
}

/**
 * Get all necromancy requests
 * Admins can see all requests, users see only their own requests
 */
async function getRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    let requests;
    
    // Drivers and admins can see all requests, users only see their own
    if (userRole === 'driver' || userRole === 'admin') {
      requests = await mockDatabase.findAllRequests();
    } else {
      requests = await mockDatabase.findRequestsByUserId(userId);
    }

    logger.info(`Necromancy requests fetched by user ${userId} with role ${userRole}`);
    res.status(200).json(requests);
  } catch (error: any) {
    logger.error(`Error fetching necromancy requests: ${error.message}`, { error });
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
}

/**
 * Update request status
 * - Drivers can update the status to 'accepted' or 'completed'
 * - Users can only update their own requests to 'cancelled'
 */
async function updateRequestStatus(req: AuthRequest, res: Response) {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Validate input
    if (!requestId || !status) {
      return res.status(400).json({ message: 'Request ID and status are required' });
    }

    // Only allow valid status values
    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Get the request to check ownership
    const request = await mockDatabase.findRequestById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Access control logic
    // 1. Users can only cancel their own requests
    // 2. Drivers can accept or complete any request
    if (userRole === 'user') {
      if (request.userId !== userId) {
        return res.status(403).json({ message: 'You can only modify your own requests' });
      }
      
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Users can only cancel requests' });
      }
    } else if (userRole === 'driver') {
      // Drivers can only set to accepted or completed
      if (status !== 'accepted' && status !== 'completed') {
        return res.status(403).json({ message: 'Drivers can only accept or complete requests' });
      }
    }
    // Admins can set any status (no restrictions)

    // Update the request status
    const updatedRequest = await mockDatabase.updateRequestStatus(requestId, status, userId);
    
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Failed to update request' });
    }

    logger.info(`Necromancy request ${requestId} status updated to ${status} by user ${userId}`);
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    logger.error(`Error updating request status: ${error.message}`, { error });
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
}

export default {
  createRequest,
  getRequests,
  updateRequestStatus
}; 