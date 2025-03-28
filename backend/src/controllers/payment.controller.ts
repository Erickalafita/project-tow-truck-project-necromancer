import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import mongoose, { Document } from 'mongoose';
import Stripe from 'stripe';
import logger from '../utils/logger'; //Import the logger
import necromancyService from '../services/necromancy.service';

// Assuming we have a Driver model and service to fetch driver details
import Driver from '../models/driver.model';

// Define interfaces for type safety
interface INecromancyRequest extends Document {
  _id: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  [key: string]: any;
}

// This is a temporary placeholder for the necromancy service
// In a real application, you would import this from '../services/necromancy.service'
const necromancyRequestService = {
  async getNecromancyRequestById(id: string): Promise<any> {
    // Implement this method to fetch a necromancy request by ID
    // In a real application, this would query the database
    return null;
  }
};

// Define a function to get driver by ID (placeholder)
const driverService = {
  async getDriverById(id: string): Promise<any> {
    try {
      const driver = await Driver.findById(id);
      return driver;
    } catch (error) {
      console.error('Error getting driver:', error);
      return null;
    }
  }
};

async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { requestId, amount, currency = 'usd' } = req.body;
    
    if (!requestId || !amount) {
      return res.status(400).json({ message: 'Request ID and amount are required' });
    }
    
    // Get the necromancy request
    const necromancyRequest = await necromancyService.getNecromancyRequestById(requestId);
    
    if (!necromancyRequest) {
      return res.status(404).json({ message: 'Necromancy request not found' });
    }
    
    // Create the payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      necromancyRequest as unknown as INecromancyRequest, 
      amount, 
      currency
    );
    logger.info(`Created payment intent for request ${requestId}: ${paymentIntent.id}`);
    
    // Create payment record in database
    await paymentService.createPaymentRecord(
      requestId,
      amount,
      currency,
      paymentIntent.id,
      paymentIntent.payment_method_types ? paymentIntent.payment_method_types[0] : 'card'
    );
    
    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error:any) {
    logger.error(`Could not create payment intent: ${error.message}`, {error});
    res.status(500).json({ message: error.message });
  }
}

async function capturePayment(req: Request, res: Response) {
  try {
    const paymentIntentId = req.params.id;
    
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }
    
    // Capture the payment intent
    const capturedPayment = await paymentService.capturePaymentIntent(paymentIntentId);
    
    if (capturedPayment) {
      // Update payment record in database
      await paymentService.updatePaymentRecord(paymentIntentId, capturedPayment.status);
      logger.info(`Captured payment: ${paymentIntentId}`);
      res.json(capturedPayment);
    } else {
      res.status(404).json({ message: 'Payment intent not found' });
    }
  } catch (error:any) {
    logger.error(`Could not capture payment: ${error.message}`, {error});
    res.status(500).json({ message: error.message });
  }
}

/**
 * Process a successful payment and transfer funds to the driver
 */
async function processSuccessfulPayment(paymentIntentId: string): Promise<void> {
  try {
    // Implement payment processing logic here
    logger.info(`Processing successful payment: ${paymentIntentId}`);
  } catch (error: any) {
    logger.error(`Error processing successful payment: ${error.message}`, { error });
    throw error;
  }
}

async function webhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No stripe signature header!');
  }

  let event;

  try {
    // We should import stripe from our payment service
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });
    
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig as string, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    logger.info(`Received webhook event: ${event.type}`);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type) {
    try {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          logger.info(`PaymentIntent for ${paymentIntent.id} was successful!`);
          // Process the successful payment
          await processSuccessfulPayment(paymentIntent.id);
          break;
        case 'payment_intent.processing':
          logger.info(`PaymentIntent for ${paymentIntent.id} is processing!`);
          break;
        case 'payment_intent.canceled':
          logger.info(`PaymentIntent for ${paymentIntent.id} was cancelled!`);
          break;
        default:
          logger.info(`Unhandled event type ${event.type}.`);
      }

      // Update the payment record if it's a payment_intent event
      if (event.type.startsWith('payment_intent.') && paymentIntent.id) {
        await paymentService.updatePaymentRecord(paymentIntent.id, paymentIntent.status);
      }
    } catch (error: any) {
      logger.error(`Error processing webhook event: ${error.message}`, { error });
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({received: true});
}

export default {
  createPaymentIntent,
  capturePayment,
  webhook,
  processSuccessfulPayment
};
