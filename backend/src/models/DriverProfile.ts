import mongoose, { Document, Schema } from 'mongoose';

export interface IDriverProfile extends Document {
  user: mongoose.Types.ObjectId;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  earnings: number;
  rating: number;
  totalRatings: number;
}

const DriverProfileSchema = new Schema<IDriverProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    earnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IDriverProfile>('DriverProfile', DriverProfileSchema);