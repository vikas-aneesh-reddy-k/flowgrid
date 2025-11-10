import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  addPayroll,
  addLeaveRequest,
  updateLeaveRequest,
} from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getEmployees);
router.get('/:id', authenticate, getEmployee);
router.post('/', authenticate, authorize('admin', 'hr_manager'), createEmployee);
router.put('/:id', authenticate, authorize('admin', 'hr_manager'), updateEmployee);
router.post('/:id/payroll', authenticate, authorize('admin', 'hr_manager'), addPayroll);
router.post('/:id/leave', authenticate, addLeaveRequest);
router.put('/leave/:leaveId', authenticate, authorize('admin', 'hr_manager'), updateLeaveRequest);

export default router;
