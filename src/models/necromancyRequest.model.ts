import mongoose, { Schema, Document } from 'mongoose';

export interface INecromancyRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  serviceType: string;
  status: string; // "pending", "offered", "accepted", "in_progress", "completed", "canceled"
  description: string;
  possibleDrivers?: mongoose.Types.ObjectId[]; //Drivers to be sent to
  acceptedDriverId?: mongoose.Types.ObjectId; // Driver who accepted the job
  accepted: boolean; //If the customer has accepted
  createdAt: Date;
  updatedAt: Date;
}

const NecromancyRequestSchema: Schema = new Schema({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  serviceType: {
    type: String,
    enum: [
      'Light-Duty Towing', 'Medium-Duty Towing', 'Heavy-Duty Towing', 'Motorcycle Towing',
      'Emergency Towing Services', 'Roadside Assistance', 'Lockouts', 'Jump Starts',
      'Tire Changes', 'Fuel Delivery', 'Long Distance Towing', 'Flatbed Towing',
      'Lowboy Towing', 'Specialty Lifts', 'Crane Services','Ignition Key Solutions',
      'Professional Heavy Duty Tire Change'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'offered', 'accepted', 'in_progress', 'completed', 'canceled'],
    default: 'pending'
  },
  description: { type: String },
  possibleDrivers: [{ type: Schema.Types.ObjectId, ref: 'Driver' }],
  acceptedDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' }, // Driver who accepted the job
  accepted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

NecromancyRequestSchema.index({ location: '2dsphere' });

export default mongoose.model<INecromancyRequest>('NecromancyRequest', NecromancyRequestSchema); 