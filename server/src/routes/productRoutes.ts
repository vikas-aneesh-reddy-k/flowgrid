import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getProducts);
router.get('/low-stock', authenticate, getLowStockProducts);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, authorize('admin', 'inventory_manager'), createProduct);
router.put('/:id', authenticate, authorize('admin', 'inventory_manager'), updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'inventory_manager'), deleteProduct);

export default router;
