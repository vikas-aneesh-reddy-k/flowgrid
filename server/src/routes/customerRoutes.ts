import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCompanyNames,
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public route for signup page
router.get('/companies', getCompanyNames);

// Protected routes
router.get('/', authenticate, getCustomers);
router.get('/:id', authenticate, getCustomer);
router.post('/', authenticate, authorize('admin', 'sales_manager', 'sales_rep'), createCustomer);
router.put('/:id', authenticate, authorize('admin', 'sales_manager', 'sales_rep'), updateCustomer);
router.delete('/:id', authenticate, authorize('admin', 'sales_manager'), deleteCustomer);

export default router;
