import express from 'express';
import {
  createDriverProfile,
  getMyDriverProfile,
  getAllDrivers,
  getDriverEarnings,
  toggleAvailability,
} from '../controllers/driverController';
import { protect, authorise } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

// Driver routes
router.post('/profile', authorise('driver'), createDriverProfile);
router.get('/profile', authorise('driver'), getMyDriverProfile);
router.get('/earnings', authorise('driver'), getDriverEarnings);
router.patch('/availability', authorise('driver'), toggleAvailability);

// Admin routes
router.get('/', authorise('admin'), getAllDrivers);

export default router;