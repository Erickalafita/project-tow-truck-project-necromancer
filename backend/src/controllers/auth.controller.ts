import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { generateToken } from '../utils/jwt'; // Import the JWT generation function
import logger from '../utils/logger'; // Import the logger

async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const result = await authService.register({ 
      firstName, 
      lastName, 
      email, 
      password,
      role: role || 'customer' // Default to customer if no role provided
    });
    logger.info(`User registered successfully: ${email}`); // Log successful registration
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: result.user,
      token: result.token 
    });
  } catch (error: any) {
    logger.error(`Error registering user: ${error.message}`, { error }); // Log the error
    res.status(400).json({ message: error.message });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    // Call the login method from authService
    const result = await authService.login({ email, password });

    logger.info(`User logged in successfully: ${email}`); // Log successful login
    
    // Send the token in a cookie or in the response body (choose one)
    res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Secure for HTTPS
    res.status(200).json({ 
      message: 'User logged in successfully', 
      user: result.user,
      token: result.token 
    });

  } catch (error: any) {
    logger.error(`Error logging in user: ${error.message}`, { error }); // Log the error
    res.status(401).json({ message: error.message });
  }
}

function logout(req: Request, res: Response) {
  // Clear the token cookie (if using cookies)
  res.clearCookie('token');
  logger.info('User logged out successfully'); // Log successful logout
  res.status(200).json({ message: 'Logged out successfully' });
}

export default {
  register,
  login,
  logout
};
