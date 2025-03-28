import mongoose, { Schema, Document } from 'mongoose';

export interface INecromancyRequest extends Document {
  requesterId: mongoose.Types.ObjectId; // Reference to the User model
  location: {
    type: string; // e.g., "Point"
    coordinates: [number, number]; // [longitude, latitude]
  };
  serviceType: string;
  status: string; // e.g., "pending", "accepted", "in_progress", "completed", "canceled"
  description: string;
  driverId?: mongoose.Types.ObjectId; // Optional reference to the Driver model (assigned driver)
  createdAt: Date;
  updatedAt: Date;
}

const NecromancyRequestSchema: Schema = new Schema({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference the User model
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
  serviceType: {
    type: String,
    enum: [
      'Light-Duty Towing',
      'Medium-Duty Towing',
      'Heavy-Duty Towing',
      'Motorcycle Towing',
      'Emergency Towing Services',
      'Roadside Assistance',
      'Lockouts',
      'Jump Starts',
      'Tire Changes',
      'Fuel Delivery',
      'Long Distance Towing',
      'Flatbed Towing',
      'Lowboy Towing',
      'Specialty Lifts',
      'Crane Services',
       'Ignition Key Solutions',
      'Professional Heavy Duty Tire Change'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'canceled'],
    default: 'pending'
  },
  description: { type: String },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' }, // Reference the Driver model
}, {
  timestamps: true,
});

NecromancyRequestSchema.index({ location: '2dsphere' }); // Enable geospatial queries

export default mongoose.model<INecromancyRequest>('NecromancyRequest', NecromancyRequestSchema); 