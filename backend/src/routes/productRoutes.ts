import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/productController';
import { protect, authorise } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

router.use(protect);

router.post('/', authorise('admin'), createProduct);
router.put('/:id', authorise('admin'), updateProduct);
router.delete('/:id', authorise('admin'), deleteProduct);
router.patch('/:id/stock', authorise('admin'), updateStock);

export default router;