import Driver, { IDriver } from '../models/driver.model';

export async function createDriver(userId: string, location: { type: string; coordinates: [number, number] }): Promise<IDriver> {
  try {
    const driver = await Driver.create({
      userId,
      location,
      available: false, // Initially set to unavailable
    });
    return driver;
  } catch (error: any ) {
    console.error('Error creating driver:', error);
    throw new Error(error.message);
  }
}

export async function getDriverById(id: string): Promise<IDriver | null> {
  try {
    const driver = await Driver.findById(id).populate('userId'); // Populate user info
    return driver;
  } catch (error: any) {
    console.error('Error getting driver:', error);
    throw new Error(error.message);
  }
}

export async function updateDriver(id: string, updateData: Partial<IDriver>): Promise<IDriver | null> {
  try {
    const driver = await Driver.findByIdAndUpdate(id, updateData, { new: true });
    return driver;
  } catch (error: any) {
    console.error('Error updating driver:', error);
    throw new Error(error.message);
  }
}

export async function deleteDriver(id: string): Promise<boolean> {
  try {
    const result = await Driver.findByIdAndDelete(id);
    return !!result;
  } catch (error: any) {
    console.error('Error deleting driver:', error);
    throw new Error(error.message);
  }
}

export async function setDriverAvailability(id: string, available: boolean): Promise<IDriver | null> {
  try {
    const driver = await Driver.findByIdAndUpdate(id, { available }, { new: true });
    return driver;
  } catch (error: any) {
    console.error('Error setting driver availability:', error);
    throw new Error(error.message);
  }
}

export async function updateDriverLocation(id: string, location: { type: string; coordinates: [number, number] }): Promise<IDriver | null> {
    try {
      const driver = await Driver.findByIdAndUpdate(id, { location }, { new: true });
      return driver;
    } catch (error: any) {
      console.error('Error updating driver location:', error);
      throw new Error(error.message);
    }
  }

export async function getAvailableDrivers(serviceType:string, location: { type: string, coordinates: number[] }, maxDistance: number = 10000): Promise<IDriver[]> {
    try {
      const [longitude, latitude] = location.coordinates;
      const drivers = await Driver.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance // Distance in meters (adjust as needed)
          }
        },
        available: true,
        skills: { $in: [serviceType] }
      });
      return drivers;
    } catch (error: any) {
      console.error('Error getting available drivers:', error);
      throw new Error(error.message);
    }
  }

// Also export as a default object for backward compatibility
export default {
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver,
  setDriverAvailability,
  updateDriverLocation,
  getAvailableDrivers
};
