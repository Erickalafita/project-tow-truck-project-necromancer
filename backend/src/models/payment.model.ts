import mongoose, { Schema, Document } from 'mongoose';

interface IPayment extends Document {
  requestId: mongoose.Types.ObjectId; // Reference to the NecromancyRequest model
  amount: number; // Amount in cents/pennies (Stripe's convention)
  currency: string; // e.g., "usd"
  stripeCustomerId?: string; // Stripe Customer ID (if applicable)
  stripePaymentIntentId: string; // Stripe PaymentIntent ID
  paymentMethod: string; // e.g., "card", "paypal" (as provided by Stripe)
  status: string; // e.g., "requires_action", "succeeded", "processing", "requires_payment_method", "canceled" (Stripe PaymentIntent statuses)
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  requestId: { type: Schema.Types.ObjectId, ref: 'NecromancyRequest', required: true }, // Reference the NecromancyRequest model
  amount: { type: Number, required: true }, // Amount in cents/pennies
  currency: { type: String, required: true, default: 'usd' },
  stripeCustomerId: { type: String }, // Stripe Customer ID
  stripePaymentIntentId: { type: String, required: true }, // Stripe PaymentIntent ID
  paymentMethod: { type: String }, // As provided by Stripe
  status: {
    type: String,
    enum: ['requires_action', 'succeeded', 'processing', 'requires_payment_method', 'canceled', 'requires_confirmation', 'requires_capture'], // Stripe PaymentIntent statuses
    default: 'requires_payment_method'  // or 'requires_action' depending on your flow
  },
}, {
  timestamps: true,
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
