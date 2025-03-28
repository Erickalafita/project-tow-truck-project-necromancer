import { INecromancyRequest } from '../models/necromancyRequest.model';
import { IDriver } from '../models/driver.model';
import driverService from '../services/driver.service';

const MAX_DISTANCE = 10000; // 10km

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function findMatchingDrivers(necromancyRequest: INecromancyRequest): Promise<IDriver[]> {
  try {
    const availableDrivers = await driverService.getAvailableDrivers(
      necromancyRequest.serviceType,
      necromancyRequest.location,
      MAX_DISTANCE
    );

    if (availableDrivers.length === 0) {
      return []; // No suitable drivers found
    }

    // Shuffle the available drivers to introduce randomness
    const shuffledDrivers = shuffleArray(availableDrivers);

    return shuffledDrivers;
  } catch (error: any) {
    console.error('Error finding matching drivers:', error);
    throw new Error(error.message);
  }
}

const matchingService =  {
  findMatchingDrivers,
};

export default matchingService; 