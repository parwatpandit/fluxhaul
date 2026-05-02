import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'dispatched' | 'delivered';
  trackingNumber: string;
  deliveryAddress: string;
  isPaid: boolean;
  driverRating?: number;
  isRated: boolean;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'delivered'],
      default: 'pending',
    },
    trackingNumber: { type: String, unique: true },
    deliveryAddress: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    driverRating: { type: Number, min: 1, max: 5 },
    isRated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OrderSchema.pre('save', function () {
  if (!this.trackingNumber) {
    this.trackingNumber = 'FH-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);