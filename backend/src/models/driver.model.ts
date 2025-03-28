import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User model (driver's user account)
  location: {
    type: string; // e.g., "Point"
    coordinates: [number, number]; // [longitude, latitude]
  };
  available: boolean;
  skills: string[]; // Array of service types the driver can perform
  profilePicture?: string; // URL to profile picture
  bio?: string; // Driver's biography/description
  stripeConnectAccountId?: string; //  Store the Stripe Connect Account ID
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Reference the User model
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  available: { type: Boolean, default: false },
  skills: [{ type: String }], // Array of service types the driver can perform
  profilePicture: { type: String },
  bio: { type: String },
  stripeConnectAccountId: { type: String }, // Store the Stripe Connect Account ID
}, {
  timestamps: true,
});

DriverSchema.index({ location: '2dsphere' }); // Enable geospatial queries

export default mongoose.model<IDriver>('Driver', DriverSchema);
