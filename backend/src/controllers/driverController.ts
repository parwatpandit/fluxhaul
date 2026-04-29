import { Request, Response } from 'express';
import DriverProfile from '../models/DriverProfile';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/authMiddleware';

// Create driver profile
export const createDriverProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vehicleType, vehicleNumber, licenseNumber } = req.body;

    const existing = await DriverProfile.findOne({ user: req.user!.id });
    if (existing) {
      res.status(400).json({ message: 'Driver profile already exists' });
      return;
    }

    const profile = await DriverProfile.create({
      user: req.user!.id,
      vehicleType,
      vehicleNumber,
      licenseNumber,
    });

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get my driver profile
export const getMyDriverProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await DriverProfile.findOne({ user: req.user!.id }).populate('user', 'name email');
    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all drivers — admin
export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const drivers = await DriverProfile.find()
      .populate('user', 'name email isBlocked')
      .skip(skip)
      .limit(limit);

    const total = await DriverProfile.countDocuments();

    res.status(200).json({ drivers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get driver earnings
export const getDriverEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await DriverProfile.findOne({ user: req.user!.id });
    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }

    const deliveredOrders = await Order.find({
      driver: req.user!.id,
      status: 'delivered',
    }).populate('items.product', 'name price');

    res.status(200).json({
      totalEarnings: profile.earnings,
      rating: profile.rating,
      totalRatings: profile.totalRatings,
      deliveredOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Toggle driver availability
export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await DriverProfile.findOne({ user: req.user!.id });
    if (!profile) {
      res.status(404).json({ message: 'Driver profile not found' });
      return;
    }
    profile.isAvailable = !profile.isAvailable;
    await profile.save();
    res.status(200).json({ isAvailable: profile.isAvailable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};