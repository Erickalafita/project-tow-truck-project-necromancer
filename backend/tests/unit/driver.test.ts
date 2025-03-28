import driverService from '../../src/services/driver.service';
import Driver from '../../src/models/driver.model';
import User from '../../src/models/user.model';
import NecromancyRequest from '../../src/models/necromancyRequest.model';

jest.mock('../../src/models/driver.model');
jest.mock('../../src/models/user.model');
jest.mock('../../src/models/necromancyRequest.model');

describe('Driver Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create a new driver', async () => {
    const userId = 'userId123';
    const location = { type: 'Point', coordinates: [0, 0] as [number, number] };
    
    const mockCreatedDriver = {
      _id: 'driverId123',
      userId,
      location,
      available: false
    };
    
    (Driver.create as jest.Mock).mockResolvedValue(mockCreatedDriver);
    
    const result = await driverService.createDriver(userId, location);
    
    expect(Driver.create).toHaveBeenCalledWith({
      userId,
      location,
      available: false
    });
    expect(result).toEqual(mockCreatedDriver);
  });

  it('should update driver location', async () => {
    const driverId = 'driverId123';
    const newLocation = { type: 'Point', coordinates: [35.123, -80.456] as [number, number] };
    
    const mockUpdatedDriver = {
      _id: driverId,
      userId: 'userId123',
      location: newLocation,
      available: true
    };
    
    (Driver.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedDriver);
    
    const result = await driverService.updateDriverLocation(driverId, newLocation);
    
    expect(Driver.findByIdAndUpdate).toHaveBeenCalledWith(
      driverId,
      { location: newLocation },
      { new: true }
    );
    expect(result).toEqual(mockUpdatedDriver);
  });
  
  it('should get a driver by ID', async () => {
    const driverId = 'driverId123';
    
    const mockDriver = {
      _id: driverId,
      userId: 'userId123',
      location: { type: 'Point', coordinates: [35.0, -80.0] as [number, number] },
      available: true
    };
    
    const mockPopulate = jest.fn().mockResolvedValue(mockDriver);
    (Driver.findById as jest.Mock).mockReturnValue({
      populate: mockPopulate
    });
    
    const result = await driverService.getDriverById(driverId);
    
    expect(Driver.findById).toHaveBeenCalledWith(driverId);
    expect(mockPopulate).toHaveBeenCalledWith('userId');
    expect(result).toEqual(mockDriver);
  });
  
  it('should update a driver', async () => {
    const driverId = 'driverId123';
    const updateData = {
      available: true,
      skills: ['Heavy-Duty Towing', 'Roadside Assistance']
    };
    
    const mockUpdatedDriver = {
      _id: driverId,
      userId: 'userId123',
      location: { type: 'Point', coordinates: [35.0, -80.0] as [number, number] },
      available: true,
      skills: ['Heavy-Duty Towing', 'Roadside Assistance']
    };
    
    (Driver.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedDriver);
    
    const result = await driverService.updateDriver(driverId, updateData);
    
    expect(Driver.findByIdAndUpdate).toHaveBeenCalledWith(
      driverId,
      updateData,
      { new: true }
    );
    expect(result).toEqual(mockUpdatedDriver);
  });
  
  it('should set driver availability', async () => {
    const driverId = 'driverId123';
    const available = true;
    
    const mockUpdatedDriver = {
      _id: driverId,
      userId: 'userId123',
      available
    };
    
    (Driver.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedDriver);
    
    const result = await driverService.setDriverAvailability(driverId, available);
    
    expect(Driver.findByIdAndUpdate).toHaveBeenCalledWith(
      driverId,
      { available },
      { new: true }
    );
    expect(result).toEqual(mockUpdatedDriver);
  });
  
  it('should delete a driver', async () => {
    const driverId = 'driverId123';
    
    (Driver.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: driverId });
    
    const result = await driverService.deleteDriver(driverId);
    
    expect(Driver.findByIdAndDelete).toHaveBeenCalledWith(driverId);
    expect(result).toBeTruthy();
  });
  
  it('should get available drivers', async () => {
    const serviceType = 'Medium-Duty Towing';
    const location = { 
      type: 'Point', 
      coordinates: [35.0, -80.0] 
    };
    const maxDistance = 10000; // 10 km in meters
    
    const mockAvailableDrivers = [
      {
        _id: 'driver1',
        userId: 'user1',
        location: { type: 'Point', coordinates: [35.01, -80.01] as [number, number] },
        available: true,
        skills: ['Medium-Duty Towing']
      },
      {
        _id: 'driver2',
        userId: 'user2',
        location: { type: 'Point', coordinates: [35.02, -80.02] as [number, number] },
        available: true,
        skills: ['Medium-Duty Towing', 'Roadside Assistance']
      }
    ];
    
    (Driver.find as jest.Mock).mockResolvedValue(mockAvailableDrivers);
    
    const result = await driverService.getAvailableDrivers(serviceType, location, maxDistance);
    
    expect(Driver.find).toHaveBeenCalledWith({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [35.0, -80.0]
          },
          $maxDistance: maxDistance
        }
      },
      available: true,
      skills: { $in: [serviceType] }
    });
    
    expect(result).toEqual(mockAvailableDrivers);
  });
}); 