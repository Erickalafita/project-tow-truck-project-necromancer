import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import driverService from '../services/driver.service';
import logger from '../utils/logger';

let io: SocketIOServer;

export function initializeSocketIO(server: Server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow all origins (for development - restrict in production)
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });

    socket.on('leave-room', (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      });

    socket.on('new-request', (message) => {
      console.log('Received new-request:', message);
      // Process the new request data (e.g., save to the database)
    });

    socket.on('location-update', async (location) => {
      // Verify token and extract user ID
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      
      // This will need to be adjusted based on your authentication implementation
      // You'll need to properly decode the JWT token to get the userId
      if (!token) {
        console.log("No authorization token provided");
        return;
      }
      
      // This is a placeholder - you should use your actual JWT verification
      // to extract the userId from the token
      let id;
      try {
        // Example of JWT decoding (simplified)
        const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        id = tokenData.userId;
      } catch (error) {
        console.error("Error extracting userId from token:", error);
        return;
      }

      if (!id) {
        console.log("Can't set location as there is no ID");
        return;
      }
      
      try {
        const driver = await driverService.updateDriverLocation(id, {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        });

        if (!driver) {
          console.log(`Driver with ID ${id} not found`);
          return;
        }

        // Broadcast the location to relevant clients
        io.emit('driver-location-updated', {
          driverId: id,
          location: driver.location,
        });
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    });
  });

  console.log('Socket.IO server initialized');
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

// Utility function to broadcast driver acceptance
export function broadcastDriverAcceptance(requestId: string, driverId: string, driverInfo: any): void {
  const io = getIO();
  io.emit('request-accepted', { 
    type: 'request-accepted',
    data: {
      requestId,
      driverId,
      name: driverInfo.name,
      eta: driverInfo.eta || 15, // Default ETA of 15 minutes if not specified
      vehicleInfo: driverInfo.vehicleInfo,
      phone: driverInfo.phone
    }
  });
  console.log(`Broadcast: Driver ${driverId} accepted request ${requestId}`);
}
