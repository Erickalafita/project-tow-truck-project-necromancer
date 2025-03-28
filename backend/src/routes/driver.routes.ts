import express, { RequestHandler } from 'express';
import driverController from '../controllers/driver.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Cast the middleware and controller functions to RequestHandler to satisfy TypeScript
const auth = authenticateToken as RequestHandler;

// Add a root GET handler for the /api/driver path
router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Driver API is running',
    endpoints: [
      { method: 'GET', path: '/available', description: 'Get available drivers' },
      { method: 'POST', path: '/', description: 'Create a new driver' },
      { method: 'GET', path: '/:id', description: 'Get driver by ID' },
      { method: 'PUT', path: '/:id', description: 'Update driver by ID' },
      { method: 'DELETE', path: '/:id', description: 'Delete driver by ID' },
      { method: 'PATCH', path: '/:id/availability', description: 'Update driver availability' },
      { method: 'PATCH', path: '/:id/location', description: 'Update driver location' }
    ] 
  });
});

// Specific routes must come before parameterized routes
router.get('/available', auth, driverController.getAvailableDrivers as RequestHandler);

// Parameterized routes
router.post('/', auth, driverController.createDriver as RequestHandler);
router.get('/:id', auth, driverController.getDriverById as RequestHandler);
router.put('/:id', auth, driverController.updateDriver as RequestHandler);
router.delete('/:id', auth, driverController.deleteDriver as RequestHandler);
router.patch('/:id/availability', auth, driverController.setDriverAvailability as RequestHandler);
router.patch('/:id/location', auth, driverController.updateDriverLocation as RequestHandler);

export default router;
