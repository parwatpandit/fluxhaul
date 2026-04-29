import express from 'express';
import {
  createWarehouse,
  getWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouseController';
import { protect, authorise } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorise('admin'));

router.post('/', createWarehouse);
router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;