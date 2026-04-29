import mongoose, { Document, Schema } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  location: string;
  address: string;
  isActive: boolean;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);