import { Request, Response } from 'express';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { department, status, page = 1, limit = 50 } = req.query;
    
    const query: any = {};
    
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query)
      .populate('userId', 'email name role')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ hireDate: -1 });

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'email name role');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    let { userId, name, email, ...employeeData } = req.body;

    // If userId is not provided, create a new user account
    if (!userId) {
      // Check if user with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // If user exists, use that userId
        userId = existingUser._id;
      } else {
        // Create a new user account
        const newUser = await User.create({
          name,
          email,
          password: 'ChangeMe123!', // Default password - user should change on first login
          role: 'sales_rep', // Default role for new employees
        });
        userId = newUser._id;
      }
    } else {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      name = user.name;
      email = user.email;
    }

    // Check if employee already exists for this user
    const existingEmployee = await Employee.findOne({ userId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee record already exists for this user' });
    }

    // Generate employee ID
    const empCount = await Employee.countDocuments();
    const employeeId = `EMP-${String(empCount + 1).padStart(5, '0')}`;

    const employee = await Employee.create({
      employeeId,
      userId,
      name,
      email,
      ...employeeData,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addPayroll = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const payrollId = `PAY-${Date.now()}`;
    employee.payroll.push({
      payrollId,
      ...req.body,
    });

    await employee.save();

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addLeaveRequest = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leaveId = `LEAVE-${Date.now()}`;
    employee.leaveRequests.push({
      leaveId,
      ...req.body,
    });

    await employee.save();

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    const employee = await Employee.findOne({ 'leaveRequests.leaveId': leaveId });
    if (!employee) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const leaveRequest = employee.leaveRequests.find(lr => lr.leaveId === leaveId);
    if (leaveRequest) {
      leaveRequest.status = status;
      await employee.save();
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const processPayroll = async (req: Request, res: Response) => {
  try {
    const { payPeriodStart, payPeriodEnd, employeeIds } = req.body;

    if (!payPeriodStart || !payPeriodEnd) {
      return res.status(400).json({ message: 'Pay period start and end dates are required' });
    }

    // Get employees to process (all active or specific ones)
    const query: any = { status: 'active' };
    if (employeeIds && employeeIds.length > 0) {
      query._id = { $in: employeeIds };
    }

    const employees = await Employee.find(query);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'No employees found to process payroll' });
    }

    const processedPayrolls = [];
    const errors = [];

    for (const employee of employees) {
      try {
        // Calculate payroll
        const baseSalary = employee.baseSalary;
        const overtimePay = 0; // Can be customized
        const bonuses = 0; // Can be customized
        const grossPay = baseSalary + overtimePay + bonuses;
        
        // Calculate deductions (simplified - 20% tax, 5% insurance)
        const taxDeduction = grossPay * 0.20;
        const insuranceDeduction = grossPay * 0.05;
        const netPay = grossPay - taxDeduction - insuranceDeduction;

        const payrollId = `PAY-${Date.now()}-${employee.employeeId}`;

        employee.payroll.push({
          payrollId,
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd),
          baseSalary,
          overtimePay,
          bonuses,
          grossPay,
          taxDeduction,
          insuranceDeduction,
          netPay,
          status: 'paid',
          payDate: new Date(),
        });

        await employee.save();
        processedPayrolls.push({
          employeeId: employee.employeeId,
          name: employee.name,
          netPay,
          payrollId,
        });
      } catch (error: any) {
        errors.push({
          employeeId: employee.employeeId,
          name: employee.name,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        processed: processedPayrolls.length,
        failed: errors.length,
        payrolls: processedPayrolls,
        errors,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
