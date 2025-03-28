import { Request, Response } from 'express';
import necromancyService from '../services/necromancy.service';
import { verifyToken } from '../utils/jwt';
import { getIO } from '../websocket/socket';

// Create a new necromancy request
async function createNecromancyRequest(req: Request, res: Response) {
  try {
    const { location, serviceType, description } = req.body;
    
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

    const requesterId = decodedToken.userId;
    
    const necromancyRequest = await necromancyService.createNecromancyRequest(
      requesterId,
      location,
      serviceType,
      description
    );
    
    res.status(201).json(necromancyRequest);
  } catch (error: any) {
    console.error('Error creating necromancy request:', error);
    res.status(500).json({ message: error.message });
  }
}

// Driver accepts a necromancy request
async function acceptNecromancyRequest(req: Request, res: Response) {
  try {
    const requestId = req.params.id;
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

    const driverId = decodedToken.userId;
    if (!driverId) {
      return res.status(400).json({ message: 'Invalid request: Missing driverId' });
    }

    const necromancyRequest = await necromancyService.acceptNecromancyRequest(driverId, requestId);

    // Notify the client
    const io = getIO();
    io.to(necromancyRequest.requesterId.toString()).emit('request-accepted', {
      requestId: requestId,
      driverId: driverId,
    });

    res.json(necromancyRequest);
  } catch (error: any) {
    console.error('Error accepting necromancy request:', error);
    res.status(500).json({ message: error.message });
  }
}

export default {
  createNecromancyRequest,
  acceptNecromancyRequest
}; 