import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';

// Create order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, deliveryAddress } = req.body;

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: `Product ${item.productId} not found` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        return;
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      // Trigger low stock alert if stock drops below threshold
      if (product.stock < product.threshold) {
        const { default: stockAlertQueue } = await import('../queues/stockQueue');
        await stockAlertQueue.add({
          productName: product.name,
          stock: product.stock,
          threshold: product.threshold,
          warehouseName: product.warehouse,
        });
      }

      totalPrice += product.price * item.quantity;
      orderItems.push({ product: product._id, quantity: item.quantity, price: product.price });
    } 

    const order = await Order.create({
      customer: req.user!.id,
      items: orderItems,
      totalPrice,
      deliveryAddress,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all orders — admin
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('driver', 'name email')
      .populate('items.product', 'name price')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.status(200).json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get my orders — customer
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: req.user!.id })
      .populate('items.product', 'name price')
      .populate('driver', 'name')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ customer: req.user!.id });

    res.status(200).json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get single order
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('driver', 'name email')
      .populate('items.product', 'name price');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update order status — admin
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Assign driver to order — admin
export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, status: 'processing' },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get assigned orders — driver
export const getAssignedOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ driver: req.user!.id })
      .populate('customer', 'name email')
      .populate('items.product', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Mark order as picked up or delivered — driver
export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['dispatched', 'delivered'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, driver: req.user!.id },
      { status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};