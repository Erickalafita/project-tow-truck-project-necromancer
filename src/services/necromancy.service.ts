import NecromancyRequest, { INecromancyRequest } from '../models/necromancyRequest.model';
import mongoose from 'mongoose';

// Re-implement matching service logic since we deleted the file
const MAX_DISTANCE = 10000; // 10km

// Simple matching function to find drivers
async function findMatchingDrivers(necromancyRequest: INecromancyRequest): Promise<any[]> {
  try {
    // Import driver model directly to avoid circular dependencies
    const Driver = require('../models/driver.model').default;
    
    // Find available drivers who offer the requested service type
    const availableDrivers = await Driver.find({
      available: true,
      skills: { $in: [necromancyRequest.serviceType] },
      location: {
        $near: {
          $geometry: necromancyRequest.location,
          $maxDistance: MAX_DISTANCE
        }
      }
    });

    return availableDrivers;
  } catch (error: any) {
    console.error('Error finding matching drivers:', error);
    throw new Error(error.message);
  }
}

async function createNecromancyRequest(
  requesterId: string,
  location: { type: string; coordinates: [number, number] },
  serviceType: string,
  description: string
): Promise<INecromancyRequest> {
  try {
    const necromancyRequest = await NecromancyRequest.create({
      requesterId,
      location,
      serviceType,
      description
    });

    // Find the matching drivers
    const possibleDrivers = await findMatchingDrivers(necromancyRequest);

    if (possibleDrivers.length > 0) {
      // Set the possibleDrivers, set status to offered
      necromancyRequest.possibleDrivers = possibleDrivers.map((driver: any) => driver._id);
      necromancyRequest.status = 'offered';
      await necromancyRequest.save();
      // Send real-time notifications to drivers via WebSockets
      const io = require('../socket').getIO();
      possibleDrivers.forEach((driver: any) => {
        io.to(driver.userId).emit('new-request', {
          requestId: necromancyRequest._id,
          serviceType: necromancyRequest.serviceType,
          location: necromancyRequest.location,
        });
      });

      console.log(`Request offered to ${possibleDrivers.length} drivers via WebSockets`);
    } else {
      necromancyRequest.status = 'pending'; // or 'no_drivers' if you prefer
      await necromancyRequest.save();
      console.log('No suitable drivers found for this request.');
    }

    return necromancyRequest;
  } catch (error: any) {
    console.error('Error creating necromancy request:', error);
    throw new Error(error.message);
  }
}

async function acceptNecromancyRequest(driverId: string, requestId: string): Promise<INecromancyRequest> {
    try {
      const necromancyRequest = await NecromancyRequest.findById(requestId);

      if (!necromancyRequest) {
        throw new Error('Necromancy request not found');
      }

      // Check if the driver is in the possibleDrivers list
      const isPossibleDriver = necromancyRequest.possibleDrivers?.some(id => id.toString() === driverId);

      if (!isPossibleDriver) {
        throw new Error('Driver not authorized to accept this request');
      }

       // Check if the customer has already accepted
       if (necromancyRequest.acceptedDriverId) {
        throw new Error('Customer has already accepted');
      }
      // Assign acceptedDriverId and set status
      necromancyRequest.acceptedDriverId = new mongoose.Types.ObjectId(driverId);
      necromancyRequest.status = "in_progress";

      await necromancyRequest.save();

      return necromancyRequest;
    } catch (error: any) {
      console.error('Error accepting necromancy request:', error);
      throw new Error(error.message);
    }
  }

export default {
  createNecromancyRequest,
  acceptNecromancyRequest
}; 