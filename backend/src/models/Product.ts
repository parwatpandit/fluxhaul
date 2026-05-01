import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  warehouse: mongoose.Types.ObjectId;
  stock: number;
  threshold: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: false },
    stock: { type: Number, required: true, min: 0 },
    threshold: { type: Number, required: true, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);