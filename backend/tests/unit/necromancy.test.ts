import necromancyService from '../../src/services/necromancy.service';
import NecromancyRequest from '../../src/models/necromancyRequest.model';
import Driver from '../../src/models/driver.model';
import mongoose from 'mongoose';

jest.mock('../../src/models/necromancyRequest.model'); // Mock the NecromancyRequest model
jest.mock('../../src/models/driver.model'); // Mock the Driver model
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ...actual.Types,
      ObjectId: {
        isValid: jest.fn().mockReturnValue(true)
      }
    }
  };
});

describe('Necromancy Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create a new necromancy request', async () => {
    const mockRequestData = {
      requesterId: 'requesterId',
      location: { type: 'Point', coordinates: [1, 1] },
      serviceType: 'Medium-Duty Towing',
      description: 'Test request',
    };
    
    const mockRequest = {
      ...mockRequestData,
      _id: 'mockId123',
      save: jest.fn().mockResolvedValue(undefined)
    };
    
    // Mock the constructor to return our mock request
    (NecromancyRequest as unknown as jest.Mock).mockImplementation(() => mockRequest);

    const result = await necromancyService.createNecromancyRequest({
      requesterId: mockRequestData.requesterId,
      location: mockRequestData.location,
      serviceType: mockRequestData.serviceType,
      description: mockRequestData.description
    });

    // Check that constructor was called with request data
    expect(NecromancyRequest).toHaveBeenCalledWith({
      requesterId: mockRequestData.requesterId,
      location: mockRequestData.location,
      serviceType: mockRequestData.serviceType,
      description: mockRequestData.description
    });
    
    // Check that save was called
    expect(mockRequest.save).toHaveBeenCalled();
    
    // The result should be our mock request (which includes save)
    // To verify the data without the function, we can do:
    expect(result).toBe(mockRequest);
    expect(result).toMatchObject(mockRequestData);
  });
  
  it('should get a necromancy request by ID', async () => {
    const mockRequest = {
      _id: 'requestId',
      requesterId: 'requesterId',
      location: { type: 'Point', coordinates: [1, 1] },
      serviceType: 'Medium-Duty Towing',
      description: 'Test request',
      status: 'pending'
    };
    
    (NecromancyRequest.findById as jest.Mock).mockResolvedValue(mockRequest);
    
    const result = await necromancyService.getNecromancyRequestById('requestId');
    
    expect(NecromancyRequest.findById).toHaveBeenCalledWith('requestId');
    expect(result).toEqual(mockRequest);
  });
  
  it('should update a necromancy request', async () => {
    const mockUpdatedRequest = {
      _id: 'requestId',
      requesterId: 'requesterId',
      location: { type: 'Point', coordinates: [1, 1] },
      serviceType: 'Medium-Duty Towing',
      description: 'Updated description',
      status: 'accepted'
    };
    
    const updateData = {
      description: 'Updated description',
      status: 'accepted'
    };
    
    (NecromancyRequest.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedRequest);
    
    const result = await necromancyService.updateNecromancyRequest('requestId', updateData);
    
    expect(NecromancyRequest.findByIdAndUpdate).toHaveBeenCalledWith(
      'requestId',
      { $set: updateData },
      { new: true, runValidators: true }
    );
    expect(result).toEqual(mockUpdatedRequest);
  });
  
  it('should get all necromancy requests', async () => {
    const mockRequests = [
      {
        _id: 'requestId1',
        requesterId: 'requesterId',
        location: { type: 'Point', coordinates: [1, 1] },
        serviceType: 'Medium-Duty Towing',
        description: 'Test request 1',
        status: 'pending'
      },
      {
        _id: 'requestId2',
        requesterId: 'requesterId',
        location: { type: 'Point', coordinates: [2, 2] },
        serviceType: 'Roadside Assistance',
        description: 'Test request 2',
        status: 'pending'
      }
    ];
    
    (NecromancyRequest.find as jest.Mock).mockResolvedValue(mockRequests);
    
    const result = await necromancyService.getAllNecromancyRequests();
    
    expect(NecromancyRequest.find).toHaveBeenCalled();
    expect(result).toEqual(mockRequests);
  });
  
  it('should delete a necromancy request', async () => {
    const mockDeleteResult = { deletedCount: 1 };
    
    (NecromancyRequest.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDeleteResult);
    
    const result = await necromancyService.deleteNecromancyRequest('requestId');
    
    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('requestId');
    expect(NecromancyRequest.findByIdAndDelete).toHaveBeenCalledWith('requestId');
    expect(result).toBeTruthy();
  });
}); 