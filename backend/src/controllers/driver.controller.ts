import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import Driver from '../models/driver.model';
import { verifyToken } from '../utils/jwt';

// Import driver service
import {
  createDriver as createDriverService,
  getDriverById as getDriverByIdService,
  updateDriver as updateDriverService,
  deleteDriver as deleteDriverService,
  setDriverAvailability as setDriverAvailabilityService,
  updateDriverLocation as updateDriverLocationService,
  getAvailableDrivers as getAvailableDriversService
} from '../services/driver.service';

// Payment function
async function payDriver(req: Request, res: Response) {
  try {
    const { driverId, amount, currency = 'usd', description } = req.body;

    if (!driverId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: driverId and amount are required' });
    }

    // Get driver to retrieve their Stripe account ID
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (!driver.stripeConnectAccountId) {
      return res.status(400).json({ message: 'Driver does not have a Stripe Connect account' });
    }

    // Create a transfer to the driver's connected account
    const transfer = await paymentService.createTransfer(
      amount, 
      currency, 
      driver.stripeConnectAccountId
    );

    res.status(200).json({
      success: true,
      transfer
    });
  } catch (error: any) {
    console.error('Error paying driver:', error);
    res.status(500).json({ message: error.message });
  }
}

// Driver management functions
async function createDriver(req: Request, res: Response) {
  try {
    const { location } = req.body;

    // Verify token and extract user ID
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token' });
    }

    let decodedToken;
    try {
      decodedToken = verifyToken(token);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }

    const userId = decodedToken.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid request: Missing userId' });
    }

    const driver = await createDriverService(userId, location);
    res.status(201).json(driver);
  } catch (error: any) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: error.message });
  }
}

async function getDriverById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const driver = await getDriverByIdService(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error: any) {
    console.error('Error getting driver:', error);
    res.status(500).json({ message: error.message });
  }
}

async function updateDriver(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const driver = await updateDriverService(id, updateData);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error: any) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: error.message });
  }
}

async function deleteDriver(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const deleted = await deleteDriverService(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: error.message });
  }
}

async function setDriverAvailability(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { available } = req.body;
    const driver = await setDriverAvailabilityService(id, available);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error: any) {
    console.error('Error setting driver availability:', error);
    res.status(500).json({ message: error.message });
  }
}

async function updateDriverLocation(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { location } = req.body;
    const driver = await updateDriverLocationService(id, location);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error: any) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ message: error.message });
  }
}

async function getAvailableDrivers(req: Request, res: Response) {
  try {
    const { serviceType } = req.query;
    const { location } = req.body;

    if (!serviceType) {
      return res.status(400).json({ message: 'Service type is required' });
    }

    const drivers = await getAvailableDriversService(serviceType as string, location);
    res.json(drivers);
  } catch (error: any) {
    console.error('Error getting available drivers:', error);
    res.status(500).json({ message: error.message });
  }
}

export default {
  payDriver,
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver,
  setDriverAvailability,
  updateDriverLocation,
  getAvailableDrivers
};
