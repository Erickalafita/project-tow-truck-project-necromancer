import express from 'express';
import authController from '../controllers/auth.controller';

const router = express.Router();

// Add a root GET handler for the /api/auth path
router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Auth API is running',
    endpoints: [
      { method: 'POST', path: '/register', description: 'Register a new user' },
      { method: 'POST', path: '/login', description: 'Login with credentials' },
      { method: 'POST', path: '/logout', description: 'Logout the current user' }
    ] 
  });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
