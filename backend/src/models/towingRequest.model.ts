import mongoose, { Schema, Document } from 'mongoose';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface ITowingRequest extends Document {
  user: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  pickupLocation: Location;
  destinationLocation: Location;
  status: 'pending' | 'accepted' | 'en_route' | 'completed' | 'cancelled';
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  notes?: string;
  price?: number;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String }
});

const TowingRequestSchema: Schema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  driver: { 
    type: Schema.Types.ObjectId, 
    ref: 'Driver', 
    default: null 
  },
  pickupLocation: { 
    type: LocationSchema, 
    required: true 
  },
  destinationLocation: { 
    type: LocationSchema, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'en_route', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  vehicleDetails: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true }
  },
  notes: { type: String },
  price: { type: Number },
  paymentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Payment' 
  }
}, {
  timestamps: true
});

export default mongoose.model<ITowingRequest>('TowingRequest', TowingRequestSchema);
