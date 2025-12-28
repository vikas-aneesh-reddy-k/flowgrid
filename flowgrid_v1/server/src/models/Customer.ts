import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  status: 'lead' | 'active' | 'premium' | 'inactive';
  company?: string;
  segment: 'Enterprise' | 'SMB' | 'Startup';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalOrders: number;
  totalValue: number;
  lastContact?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['lead', 'active', 'premium', 'inactive'],
    default: 'active',
  },
  company: {
    type: String,
    trim: true,
  },
  segment: {
    type: String,
    enum: ['Enterprise', 'SMB', 'Startup'],
    default: 'SMB',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  lastContact: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ segment: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
