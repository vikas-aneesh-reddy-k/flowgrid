import mongoose, { Schema, Document } from 'mongoose';

interface IPayroll {
  payrollId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  baseSalary: number;
  overtimePay: number;
  bonuses: number;
  grossPay: number;
  taxDeduction: number;
  insuranceDeduction: number;
  netPay: number;
  status: 'paid' | 'pending' | 'failed';
  payDate?: Date;
}

interface ILeaveRequest {
  leaveId: string;
  type: 'Annual Leave' | 'Sick Leave' | 'Maternity Leave' | 'Personal Leave';
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
  appliedDate: Date;
}

export interface IEmployee extends Document {
  employeeId: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: Date;
  baseSalary: number;
  status: 'active' | 'inactive' | 'terminated';
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  payroll: IPayroll[];
  leaveRequests: ILeaveRequest[];
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  hireDate: {
    type: Date,
    required: true,
  },
  baseSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active',
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  payroll: [{
    payrollId: {
      type: String,
      required: true,
    },
    payPeriodStart: {
      type: Date,
      required: true,
    },
    payPeriodEnd: {
      type: Date,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    overtimePay: {
      type: Number,
      default: 0,
    },
    bonuses: {
      type: Number,
      default: 0,
    },
    grossPay: {
      type: Number,
      required: true,
    },
    taxDeduction: {
      type: Number,
      default: 0,
    },
    insuranceDeduction: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'pending',
    },
    payDate: Date,
  }],
  leaveRequests: [{
    leaveId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Annual Leave', 'Sick Leave', 'Maternity Leave', 'Personal Leave'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
    },
    reason: {
      type: String,
      required: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ userId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
