import express from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Use type assertion for middleware
const auth = authenticateToken as express.RequestHandler;

// Create a payment intent
router.post('/intent', auth, paymentController.createPaymentIntent as express.RequestHandler);

// Capture a payment
router.post('/capture/:id', auth, paymentController.capturePayment as express.RequestHandler);

// Stripe webhook (no auth required as it's called by Stripe)
router.post('/webhook', paymentController.webhook as express.RequestHandler);

export default router;
