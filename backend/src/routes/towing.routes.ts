import express from 'express';
import towingController from '../controllers/towing.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Use type assertion for middleware
const auth = authenticateToken as express.RequestHandler;

// Create a new towing request
router.post('/', auth, towingController.createTowingRequest as express.RequestHandler);

// Get a towing request by ID
router.get('/:id', auth, towingController.getTowingRequestById as express.RequestHandler);

// Update a towing request by ID
router.put('/:id', auth, towingController.updateTowingRequest as express.RequestHandler);

// Delete a towing request by ID
router.delete('/:id', auth, towingController.deleteTowingRequest as express.RequestHandler);

export default router;
