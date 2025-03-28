import express from 'express';
import userController from '../controllers/user.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Use type assertion for middleware
const auth = authenticateToken as express.RequestHandler;

// Get user profile (authenticated user's own profile)
router.get('/profile', auth, userController.getProfile as express.RequestHandler);

// Update user profile (authenticated user's own profile)
router.put('/profile', auth, userController.updateProfile as express.RequestHandler);

// Admin routes for managing all users
router.get('/', auth, userController.getAllUsers as express.RequestHandler);
router.get('/:id', auth, userController.getUserById as express.RequestHandler);
router.post('/', auth, userController.createUser as express.RequestHandler);
router.put('/:id', auth, userController.updateUser as express.RequestHandler);
router.delete('/:id', auth, userController.deleteUser as express.RequestHandler);

export default router;
