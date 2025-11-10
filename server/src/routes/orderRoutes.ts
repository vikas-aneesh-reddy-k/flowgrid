import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateInvoiceStatus,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', authenticate, authorize('admin', 'sales_manager', 'sales_rep'), createOrder);
router.put('/:id', authenticate, authorize('admin', 'sales_manager'), updateOrder);
router.put('/:id/invoice', authenticate, authorize('admin', 'accountant'), updateInvoiceStatus);

export default router;
