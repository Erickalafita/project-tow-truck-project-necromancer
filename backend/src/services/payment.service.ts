import Stripe from 'stripe';
import mongoose, { Document } from 'mongoose';
import NecromancyRequest from '../models/necromancyRequest.model';
import Payment from '../models/payment.model';
import dotenv from 'dotenv';

// Define interfaces for type safety
interface INecromancyRequest extends Document {
  _id: mongoose.Types.ObjectId;
  [key: string]: any;
}

interface IPayment extends Document {
  requestId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  paymentMethod: string;
  stripeCustomerId?: string;
  status: string;
  [key: string]: any;
}

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in the environment.');
}

// Initialize Stripe with the secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion, // Cast to API version type
});

/**
 * Create a payment intent in Stripe
 */
async function createPaymentIntent(necromancyRequest: INecromancyRequest, amount: number, currency: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents/pennies
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        requestId: necromancyRequest._id.toString(),
      },
    });

    return paymentIntent;
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);
    throw new Error(error.message);
  }
}

/**
 * Retrieve a payment intent from Stripe
 */
async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    console.error('Error retrieving PaymentIntent:', error);
    throw new Error(error.message);
  }
}

/**
 * Capture a payment intent in Stripe
 */
async function capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    console.error('Error capturing PaymentIntent:', error);
    throw new Error(error.message);
  }
}

/**
 * Create a payment record in the database
 */
async function createPaymentRecord(
  requestId: string,
  amount: number,
  currency: string,
  stripePaymentIntentId: string,
  paymentMethod: string,
  stripeCustomerId?: string
): Promise<IPayment> {
  try {
    const payment = await Payment.create({
      requestId,
      amount,
      currency,
      stripePaymentIntentId,
      paymentMethod,
      stripeCustomerId
    });
    
    return payment as IPayment;
  } catch (error: any) {
    console.error('Error creating Payment record:', error);
    throw new Error(error.message);
  }
}

/**
 * Update a payment record in the database
 */
async function updatePaymentRecord(stripePaymentIntentId: string, status: string): Promise<IPayment | null> {
  try {
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: stripePaymentIntentId },
      { status: status },
      { new: true } // Return the updated document
    );
    
    return payment as IPayment | null;
  } catch (error: any) {
    console.error('Error updating Payment record:', error);
    throw new Error(error.message);
  }
}

/**
 * Create a transfer to a connected account (Stripe Connect)
 */
async function createTransfer(amount: number, currency: string, destinationAccountId: string): Promise<Stripe.Transfer> {
  try {
    const transfer = await stripe.transfers.create({
      amount: amount, // Amount to transfer in cents/pennies
      currency: currency,
      destination: destinationAccountId, // The connected account ID
    });
    return transfer;
  } catch (error: any) {
    console.error('Error creating transfer:', error);
    throw new Error(error.message);
  }
}

export default {
  createPaymentIntent,
  retrievePaymentIntent,
  capturePaymentIntent,
  createPaymentRecord,
  updatePaymentRecord,
  createTransfer
};
